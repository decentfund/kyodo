var DecentToken = artifacts.require('./DecentToken.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var deployParameters = require('./deploy_parameters.json');
var tokenInstance;

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    tokenInstance = DecentToken.at(DecentToken.address);
    const { accounts } = deployParameters;

    // Minting initial distribution
    Object.keys(accounts).forEach(async address => {
      await tokenInstance.mint(address, accounts[address]);
    });

    // Minting reserve tokens
    let totalToMint = Object.values(accounts).reduce(
      (acc, value) => acc + value,
      0,
    );
    await tokenInstance.mint(KyodoDAO.address, totalToMint * 0.5);
  });
};
