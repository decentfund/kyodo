var DecentToken = artifacts.require('./DecentToken.sol');
var deployParameters = require('./deploy_parameters.json');
var tokenInstance;

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    tokenInstance = await deployer.deploy(DecentToken);
    const { accounts } = deployParameters;
    Object.keys(accounts).forEach(address => {
      tokenInstance.mint(address, accounts[address]);
    });
  });
};
