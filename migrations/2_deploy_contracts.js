var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer
    .deploy(DecentToken)
    .then(() => deployer.deploy(KyodoDAO, DecentToken.address))
    .then(() => {
      DecentToken.at(DecentToken.address).transferOwnership(KyodoDAO.address);
    })
    .then(() => {
      KyodoDAO.at(KyodoDAO.address).startNewPeriod();
      KyodoDAO.at(KyodoDAO.address).setPeriodDaysLength(14);
    });
};
