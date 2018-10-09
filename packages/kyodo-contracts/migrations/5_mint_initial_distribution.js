var Token = artifacts.require('./Token.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Registry = artifacts.require('./Registry.sol');
var deployParameters = require('./deploy_parameters.json');
var getKyodoInstance = require('./getKyodoInstance');
var tokenInstance;

module.exports = deployer => {
  deployer.then(async () => {
    const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);
    tokenInstance = Token.at(Token.address);
    const { accounts: distAccounts } = deployParameters;
    // Minting initial distribution
    Object.keys(distAccounts).forEach(async address => {
      const amount = distAccounts[address] * Math.pow(10, 18);
      await tokenInstance.mint(amount);
      await tokenInstance.transfer(address, amount);
    });
    // Minting reserve tokens
    let totalToMint = Object.values(distAccounts).reduce(
      (acc, value) => acc + value,
      0,
    );
    const reserve = totalToMint * 0.5 * Math.pow(10, 18);
    await tokenInstance.mint(reserve);
    // TODO: Transfer to multisig
    await tokenInstance.transfer(kyodoInstance.address, reserve);
    // Pass ownership to KyodoDAO
    const colonyAddress = await kyodoInstance.colony();
    await tokenInstance.setOwner(colonyAddress);
  });
};
