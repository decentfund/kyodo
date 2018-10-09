var Token = artifacts.require('./Token.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Registry = artifacts.require('./Registry.sol');
var getColonyClient = require('./getColonyClient');
var getKyodoInstance = require('./getKyodoInstance');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);

    const colonyNetworkClient = getColonyClient(network, accounts);
    await colonyNetworkClient.init();

    // TODO: Verify if colony exists
    // Create new colony
    const data = await colonyNetworkClient.createColony.send({
      tokenAddress: Token.address,
    });

    const {
      eventData: { colonyAddress },
    } = data;

    // Setting KyodoDAO Colony address
    await kyodoInstance.setColonyAddress(colonyAddress);
  });
};
