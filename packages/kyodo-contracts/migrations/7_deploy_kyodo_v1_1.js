var KyodoDAO_V1 = artifacts.require("./KyodoDAO_V1.sol");
var Token = artifacts.require("./Token.sol");
var Registry = artifacts.require("./Registry.sol");
var OwnedUpgradeabilityProxy = artifacts.require(
  "./OwnedUpgradeabilityProxy.sol"
);

module.exports = deployer => {
  deployer.then(async () => {
    // Deploying Kyodo contract version 1.1
    await deployer.deploy(KyodoDAO_V1);

    // Get proxy address from registry
    const kyodoProxy = await Registry.at(Registry.address).getVersion("1.0");

    // Ugrading proxy implementation address
    await OwnedUpgradeabilityProxy.at(kyodoProxy).upgradeTo(
      KyodoDAO_V1.address
    );

    // Setting token address for proxy
    await KyodoDAO_V1.at(kyodoProxy).setTokenAddress(Token.address);

    await KyodoDAO_V1.at(kyodoProxy).setName("decent.fund");
  });
};
