const KyodoDAO_V1 = artifacts.require('./KyodoDAO_V1.sol');
const Registry = artifacts.require('./Registry.sol');
const OwnedUpgradeabilityProxy = artifacts.require(
  './OwnedUpgradeabilityProxy.sol',
);
const Ownable = artifacts.require('./Ownable.sol');
const DomainsV1 = artifacts.require('DomainsV1');
const DomainsV2 = artifacts.require('DomainsV2');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const registry = await Registry.at(Registry.address);
    const kyodoProxyAddress = await registry.getVersion('1.0');
    const kyodoProxy = await OwnedUpgradeabilityProxy.at(kyodoProxyAddress);

    // Upgrading Kyodo V1 contract
    await deployer.deploy(KyodoDAO_V1);
    await kyodoProxy.upgradeTo(KyodoDAO_V1.address);

    // Get Kyodo DAO V1 instance
    const kyodoInstance = await KyodoDAO_V1.at(kyodoProxyAddress);

    // Upgrading Domains contract
    // Get domains proxy address
    const domainsProxyAddress = await kyodoInstance.domains();
    const domainsProxy = await OwnedUpgradeabilityProxy.at(domainsProxyAddress);

    // Get domains V1 at domains proxy
    const domainsV1 = await DomainsV1.at(domainsProxyAddress);

    // Saving existing domains
    const domainsLength = await domainsV1.getDomainsLength();
    const currentDomains = [];
    for (let i = 0; i < domainsLength; i++) {
      const storedDomain = await domainsV1.getDomain(i);
      const domain = {
        code: storedDomain[0],
        potId: storedDomain[1].toNumber(),
      };
      currentDomains.push(domain);
    }

    // deploy domains v2 logic
    await deployer.deploy(DomainsV2);

    // upgrade
    await domainsProxy.upgradeTo(DomainsV2.address);

    const ownableDomains = await Ownable.at(domainsProxyAddress);

    // Get domains V2 at domains proxy
    const domainsV2 = await DomainsV2.at(domainsProxyAddress);

    // Temporary changing domains ownership
    await kyodoInstance.changeDomainsProxyOwner(accounts[0]);

    // Readding domains
    for (var i = 0; i < currentDomains.length; i++) {
      await domainsV2.addDomain(currentDomains[i].code, i + 2); // i + 2 will refer to pot id in colony, given potId = 1 for root domain
    }

    // Restore ownership
    await ownableDomains.transferOwnership(kyodoProxyAddress);
  });
};
