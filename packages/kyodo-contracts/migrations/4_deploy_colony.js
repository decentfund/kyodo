var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Token = artifacts.require('./Token.sol');
var getColonyClient = require('./getColonyClient');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const kyodoInstance = KyodoDAO.at(KyodoDAO.address);

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
