//automated period cycles
const Dagger = require("eth-dagger");

// connect to Dagger ETH main network (network id: 1) over web socket
const dagger = new Dagger("wss://mainnet.dagger.matic.network"); // dagger server

exports.getCurrentBlock = async () => {
  await dagger.once("latest:block.number", function(result) {
    console.log("Current block number: ", result);
    return result;
  });
};
