var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var getColonyClient = require('./getColonyClient');
var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const Kyodo = KyodoDAO.at(KyodoDAO.address);

    const { domains } = deployParameters;

    // Get colony client
    const colonyNetworkClient = getColonyClient(network, accounts);
    const colonyAddress = await Kyodo.Colony.call();
    const colonyClient = await colonyNetworkClient.getColonyClientByAddress(
      colonyAddress,
    );

    await colonyClient.setOwnerRole.send({ user: KyodoDAO.address });

    // Generating necessary amount of domains and writing initial distribution
    const domainsCount = domains.length;
    for (var i = 0; i < domainsCount; i++) {
      await Kyodo.addDomain(domains[i].code);
    }

    // Starting new period
    await Kyodo.startNewPeriod();

    // Setting period lenght to 30 days
    await Kyodo.setPeriodDaysLength(30);
  });
};
