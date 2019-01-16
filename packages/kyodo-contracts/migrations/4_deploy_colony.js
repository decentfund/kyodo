var Token = artifacts.require('./Token.sol');
var Registry = artifacts.require('./Registry.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var getColonyClient = require('./getColonyClient');
var getKyodoInstance = require('./getKyodoInstance');

module.exports = async (deployer, network, accounts) => {
  const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);

  const colonyNetworkClient = getColonyClient(network, accounts);
  await colonyNetworkClient.init();

  // TODO: Verify if colony exists
  // Create new colony
  const tokenDeployed = await Token.deployed();

  const data = await colonyNetworkClient.createColony.send({
    tokenAddress: tokenDeployed.address,
  });

  const {
    eventData: { colonyAddress },
  } = data;

  // Setting KyodoDAO Colony address
  await kyodoInstance.setColonyAddress(colonyAddress);
};
