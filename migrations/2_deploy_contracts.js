var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer
    .deploy(DecentToken)
    .then(() => {
      DecentToken.at(DecentToken.address).mint(accounts[0], 752);
      DecentToken.at(DecentToken.address).mint(accounts[1], 7260 - 752);
    })
    .then(() => deployer.deploy(KyodoDAO, DecentToken.address))
    // .then(() => {
    // DecentToken.at(DecentToken.address).transferOwnership(KyodoDAO.address);
    // })
    .then(() => {
      KyodoDAO.at(KyodoDAO.address).startNewPeriod();
      KyodoDAO.at(KyodoDAO.address).setPeriodDaysLength(14);
    });
};
