const Dagger = require("eth-dagger");
const dagger = new Dagger("wss://mainnet.dagger.matic.network"); // dagger server

exports.getCurrentBlock = async () => {
  let latestBlock = await dagger.once("latest:block.number", result => {
    console.log("Current block number: ", result);
    return result;
  });
  return latestBlock;
};
