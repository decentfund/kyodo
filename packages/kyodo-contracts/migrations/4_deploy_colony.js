var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Token = artifacts.require('./Token.sol');
var getColonyClient = require('./getColonyClient');
var addDomain = require('./addDomain');
var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const kyodoInstance = KyodoDAO.at(KyodoDAO.address);

    const { domains } = deployParameters;

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

    // Get colony client
    const colonyClient = await colonyNetworkClient.getColonyClientByAddress(
      colonyAddress,
    );

    // Generating necessary amount of domains and writing initial distribution
    const domainsCount = domains.length;
    for (var i = 0; i < domainsCount; i++) {
      await addDomain(colonyClient, 1);
    }
  });
};
