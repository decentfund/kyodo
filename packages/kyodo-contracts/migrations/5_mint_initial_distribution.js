var Token = artifacts.require('./Token.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var deployParameters = require('./deploy_parameters.json');
var kyodoInstance;
var tokenInstance;

module.exports = deployer => {
  deployer.then(async () => {
    kyodoInstance = KyodoDAO.at(KyodoDAO.address);

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
    await tokenInstance.transfer(KyodoDAO.address, reserve);

    // Pass ownership to KyodoDAO
    const colonyAddress = await kyodoInstance.Colony();
    await tokenInstance.setOwner(colonyAddress);
  });
};
