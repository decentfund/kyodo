var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const tokenInstance = DecentToken.at(DecentToken.address);
    const totalSupply = await tokenInstance.totalSupply();
    await tokenInstance.mint(KyodoDAO.address, totalSupply * 0.05);
  });
};
