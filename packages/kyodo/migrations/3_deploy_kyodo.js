var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');
var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(KyodoDAO, DecentToken.address);
    const { accounts } = deployParameters;
    const addresses = Object.keys(accounts);
    await KyodoDAO.at(KyodoDAO.address).addManyToWhitelist(addresses);
  });
};
