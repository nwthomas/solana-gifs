const anchor = require("@project-serum/anchor");

const main = async () => {
  console.log("Starting test...");

  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.Myepicproject;
  const txn = await program.rpc.startStuffOff();

  console.log("Your transaction signature:", txn);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
