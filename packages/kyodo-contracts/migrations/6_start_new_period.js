var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Registry = artifacts.require('./Registry.sol');
var getColonyClient = require('./getColonyClient');
var getKyodoInstance = require('./getKyodoInstance');
var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);

    const { domains } = deployParameters;

    // Get colony client
    const colonyNetworkClient = getColonyClient(network, accounts);
    const colonyAddress = await kyodoInstance.colony();
    const colonyClient = await colonyNetworkClient.getColonyClientByAddress(
      colonyAddress,
    );

    const domainsAddress = await kyodoInstance.domains();

    await colonyClient.setAdminRole.send({
      user: domainsAddress,
    });

    await colonyClient.setOwnerRole.send({
      user: kyodoInstance.address,
    });

    // Generating necessary amount of domains and writing initial distribution
    const domainsCount = domains.length;
    for (var i = 0; i < domainsCount; i++) {
      await kyodoInstance.addDomain(domains[i].code);
    }

    // Starting new period
    await kyodoInstance.startNewPeriod();

    // Setting period lenght to 30 days
    await kyodoInstance.setPeriodDaysLength(30);
  });
};
