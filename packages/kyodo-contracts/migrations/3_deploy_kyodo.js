var tdr = require('truffle-deploy-registry');
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
var encodeCall = require('../helpers/encodeCall');

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

    const registryInstance = await deployer.deploy(Registry);

    if (!tdr.isDryRunNetworkName(network)) {
      await tdr.appendInstance(registryInstance);
    }

    // data to set owner to publisher
    const initializeData = encodeCall('initialize', ['address'], [accounts[0]]);

    // Deploying Kyodo contract
    await deployer.deploy(KyodoDAO);

    // Setting new proxy
    const kyodoProxy = await OwnedUpgradeabilityProxy.new();

    // Initializing proxy with data
    await kyodoProxy.upgradeToAndCall(KyodoDAO.address, initializeData);

    // Storing kyodo proxy 1.0 in registry
    await registryInstance.addVersion('1.0', kyodoProxy.address);

    const kyodoProxyInstance = await KyodoDAO.at(kyodoProxy.address);

    // Setting token address for proxy
    await kyodoProxyInstance.setTokenAddress(Token.address);

    // Deploying members contract
    const membersProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      MembersV1,
    );
    await kyodoProxyInstance.setMembersAddress(membersProxy.address);

    // Deploying domains contract
    const domainsProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      DomainsV1,
    );
    await kyodoProxyInstance.setDomainsAddress(domainsProxy.address);

    // Deploying domains contract
    const periodsProxy = await deployKyodoDependencyProxy(
      kyodoProxy.address,
      PeriodsV1,
    );
    await kyodoProxyInstance.setPeriodsAddress(periodsProxy.address);

    // Adding users to whitelist
    const { accounts: initAccounts } = deployParameters;
    const addresses = Object.keys(initAccounts);
    await kyodoProxyInstance.addManyToWhitelist(addresses);
  });
};
