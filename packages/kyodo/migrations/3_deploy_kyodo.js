var sum = require('lodash/sum');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');
var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(KyodoDAO, DecentToken.address);
    const { accounts } = deployParameters;
    const addresses = Object.keys(accounts);
    await KyodoDAO.at(KyodoDAO.address).addManyToWhitelist(addresses);
    const totalMembersTokens = sum(Object.values(accounts));
    const reserve = totalMembersTokens * 0.5;
    await DecentToken.at(DecentToken.address).mint(KyodoDAO.address, reserve);
    await KyodoDAO.at(KyodoDAO.address).startNewPeriod();
    return KyodoDAO.at(KyodoDAO.address).setPeriodDaysLength(14);
  });
};
