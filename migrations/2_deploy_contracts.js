var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(DecentToken).then(() => {
    return deployer.deploy(KyodoDAO, DecentToken.address);
  });
};
