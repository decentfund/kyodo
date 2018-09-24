var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Token = artifacts.require('./Token.sol');
var deployParameters = require('./deploy_parameters.json');
var getColonyClient = require('./getColonyClient');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const colonyNetworkClient = getColonyClient(network, accounts);
    await colonyNetworkClient.init();

    await deployer.deploy(KyodoDAO, Token.address);
    const { accounts: initAccounts } = deployParameters;
    const addresses = Object.keys(initAccounts);
    await KyodoDAO.at(KyodoDAO.address).addManyToWhitelist(addresses);
  });
};
