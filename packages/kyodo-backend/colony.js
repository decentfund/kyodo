const { Colony } = require("./db.js");
const { initiateNetwork } = require("./network.js");
const { getCurrentBlock } = require("./utils/getCurrentBlock");

exports.createColony = async (req, res) => {
  const tokenAddress = await networkClient.createToken({
    name: req.body.tokenName,
    symbol: req.body.tokenSymbol
  });
  console.log("Token address: " + tokenAddress);

  const {
    eventData: { colonyId, colonyAddress }
  } = await networkClient.createColony.send({ tokenAddress });

  console.log("Colony ID: " + colonyId);
  console.log("Colony address: " + colonyAddress);

  const colonyClient = await networkClient.getColonyClient(colonyId);
  const metaColonyClient = await networkClient.getMetaColonyClient();
  console.log("Meta Colony address: " + metaColonyClient.contract.address);
  const currentBlock = await getCurrentBlock();

  const colony = new Colony({
    colonyId: colonyId,
    colonyAddress: colonyAddress,
    tokenAddress: tokenAddress,
    tokenName: req.body.tokenName,
    tokenSymbol: req.body.tokenSymbol,
    creationBlockNumber: currentBlock
  });

  colony.save((err, colony) => {
    if (err) return console.error(err);
  });

  res.end(`{"success" : Added ${colony} Successfully, "status" : 200}`);
};

exports.getColonyInstanceFromId = async id => {
  let networkClient = await initiateNetwork();
  return await networkClient.getColonyClient(id);
};

exports.getColonyInstanceFromAddress = async address => {
  let networkClient = await initiateNetwork();
  return await networkClient.getColonyClient(address);
};

exports.getColonies = async (req, res) => {
  let colonies = await Colony.find((err, colonies) => {
    if (err) return console.error(err);
    console.log(colonies);
    res.send(`ALL AVAILABLE TASKS: ${colonies}`);
  });
};
