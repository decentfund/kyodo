var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(DecentToken);
  });
};
