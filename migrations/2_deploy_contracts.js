var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');
var deployParameters = require('./deploy_parameters');
var tokenInstance;

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    tokenInstance = await deployer.deploy(DecentToken);
    await deployParameters.accounts.map(account => {
      for (var key in account) {
        if (account.hasOwnProperty(key)) {
          tokenInstance.mint(key, account[key]);
        }
      }
      return true;
    });
  });
};
