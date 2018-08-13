var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(KyodoDAO, DecentToken.address);
    await KyodoDAO.at(KyodoDAO.address).startNewPeriod();
    return KyodoDAO.at(KyodoDAO.address).setPeriodDaysLength(14);
  });
};
