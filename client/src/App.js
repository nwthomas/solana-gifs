import * as React from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import "./App.css";
import idl from "./idl.json";
import kp from "./keypair.json";
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl("devnet");

const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "nwthomas_";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// const TEST_GIFS = [
//   "https://64.media.tumblr.com/442513caac35229ccdd5e39fe822d6bf/f5c2981514e757fd-01/s500x750/a644d95d7d0936a19d19c5737e071711edfb489c.gifv",
//   "https://media0.giphy.com/media/3ornjSL2sBcPflIDiU/giphy.gif?cid=790b7611555077c08045202155f9793478aac166ca13dca2&rid=giphy.gif&ct=g",
//   "https://media2.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=790b761117f624da6cf7156e60690e5c6996775a6b388278&rid=giphy.gif&ct=g",
//   "https://64.media.tumblr.com/7845da923c4dc12408bb731c0030a1b6/tumblr_mx5p8wJNty1rk2xpdo1_540.gifv",
// ];

const App = () => {
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [gifList, setGifList] = React.useState([]);

  const checkIfWalletConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted: true });
          if (response && response.publicKey) {
            console.log(
              "Connected with Public Key:",
              response.publicKey.toString()
            );
            setWalletAddress(response.publicKey.toString());
          }
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    window.addEventListener("load", async () => {
      await checkIfWalletConnected();
    });
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifs: ", error);
      setGifList(null);
    }
  };

  React.useEffect(() => {
    if (walletAddress) {
      getGifList();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnnectedContainer = () => {
    return (
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        Connect to Wallet
      </button>
    );
  };

  const onInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!");
      return;
    }
    console.log("Gif link:", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("GIF sucesfully sent to program", inputValue);

      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }

    return (
      <div className="connected-container">
        <input
          type="text"
          placeholder="Enter gif link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button className="cta-button submit-gif-button" onClick={sendGif}>
          Submit
        </button>
        <div className="gif-grid">
          {/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 Star Wars Gifs</p>
          <p className="sub-text">
            View the Star Wars GIF collection in the metaverse ✨
          </p>
          {!walletAddress ? renderNotConnnectedContainer() : null}
          {walletAddress ? renderConnectedContainer() : null}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
