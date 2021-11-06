import * as React from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "nwthomas_";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://64.media.tumblr.com/442513caac35229ccdd5e39fe822d6bf/f5c2981514e757fd-01/s500x750/a644d95d7d0936a19d19c5737e071711edfb489c.gifv",
  "https://media0.giphy.com/media/3ornjSL2sBcPflIDiU/giphy.gif?cid=790b7611555077c08045202155f9793478aac166ca13dca2&rid=giphy.gif&ct=g",
  "https://media2.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=790b761117f624da6cf7156e60690e5c6996775a6b388278&rid=giphy.gif&ct=g",
  "https://64.media.tumblr.com/7845da923c4dc12408bb731c0030a1b6/tumblr_mx5p8wJNty1rk2xpdo1_540.gifv",
];

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

  React.useEffect(() => {
    if (walletAddress) {
      setGifList(TEST_GIFS);
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

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);
    } else {
      console.log("Empty input. Try again.");
    }
  };

  const renderConnectedContainer = () => (
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
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

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
