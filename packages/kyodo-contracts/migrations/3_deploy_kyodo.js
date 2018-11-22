var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Token = artifacts.require('./Token.sol');
var MembersV1 = artifacts.require('./MembersV1.sol');
var DomainsV1 = artifacts.require('./DomainsV1.sol');
var PeriodsV1 = artifacts.require('./PeriodsV1.sol');
var Registry = artifacts.require('./Registry.sol');
var OwnedUpgradeabilityProxy = artifacts.require(
  './OwnedUpgradeabilityProxy.sol',
);
var deployParameters = require('./getDeployParameters');
var getColonyClient = require('./getColonyClient');
var encodeCall = require('./encodeCall');

module.exports = (deployer, network, accounts) => {
  // Helper to setup dependency contracts
  const deployKyodoDependencyProxy = async (kyodoProxyAddress, module) => {
    // Set ownership to kyodo proxy
    const kyodoDepInitializeData = encodeCall(
      'initialize',
      ['address'],
      [kyodoProxyAddress],
    );

    await deployer.deploy(module);

    // Initting new proxy
    const proxy = await OwnedUpgradeabilityProxy.new();
    // Upgrading proxy version and initializing
    await proxy.upgradeToAndCall(module.address, kyodoDepInitializeData);

    return proxy;
  };

  deployer.then(async () => {
    const colonyNetworkClient = getColonyClient(network, accounts);
    await colonyNetworkClient.init();

    await deployer.deploy(Registry);

    // data to set owner to publisher
    const initializeData = encodeCall('initialize', ['address'], [accounts[0]]);

    // Deploying Kyodo contract
    await deployer.deploy(KyodoDAO);

    // Setting new proxy
    const kyodoProxy = await OwnedUpgradeabilityProxy.new();

    // Initializing proxy with data
    await kyodoProxy.upgradeToAndCall(KyodoDAO.address, initializeData);

    // Storing kyodo proxy 1.0 in registry
    await Registry.at(Registry.address).addVersion('1.0', kyodoProxy.address);

    // Setting token address for proxy
    await KyodoDAO.at(kyodoProxy.address).setTokenAddress(Token.address);

    // Deploying members contract
    const membersProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      MembersV1,
    );
    await KyodoDAO.at(kyodoProxy.address).setMembersAddress(
      membersProxy.address,
    );

    // Deploying domains contract
    const domainsProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      DomainsV1,
    );
    await KyodoDAO.at(kyodoProxy.address).setDomainsAddress(
      domainsProxy.address,
    );

    // Deploying domains contract
    const periodsProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      PeriodsV1,
    );
    await KyodoDAO.at(kyodoProxy.address).setPeriodsAddress(
      periodsProxy.address,
    );

    // Adding users to whitelist
    const { accounts: initAccounts } = deployParameters;
    const addresses = Object.keys(initAccounts);
    await KyodoDAO.at(kyodoProxy.address).addManyToWhitelist(addresses);
  });
};
