var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = async function(deployer, network, accounts) {
  const token = await deployer.deploy(DecentToken);
  await deployer.deploy(KyodoDAO, token.address);
};
