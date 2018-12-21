var Token = artifacts.require('./Token.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var Registry = artifacts.require('./Registry.sol');
var getKyodoInstance = require('./getKyodoInstance');
var tokenInstance;
var deployParameters = require('./getDeployParameters');

module.exports = deployer => {
  deployer.then(async () => {
    const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);
    tokenInstance = await Token.at(Token.address);
    const { accounts: distAccounts } = deployParameters;
    // Minting initial distribution
    Object.keys(distAccounts).forEach(async address => {
      const specifiedAmount = distAccounts[address];
      if (specifiedAmount > 0) {
        // FIXME: this works for tokens with 18 decimals only
        const convertedAmount = web3.utils.toWei(
          specifiedAmount.toString(),
          'ether',
        );
        await tokenInstance.mint(convertedAmount);
        await tokenInstance.transfer(address, convertedAmount);
      }
    });
    // Minting reserve tokens
    let totalToMint = Object.values(distAccounts).reduce(
      (acc, value) => acc + value,
      0,
    );
    const reserve = totalToMint * 0.5;
    await tokenInstance.mint(web3.utils.toWei(reserve.toString(), 'ether'));
    // TODO: Transfer to multisig
    await tokenInstance.transfer(kyodoInstance.address, reserve);
    // Pass ownership to KyodoDAO
    const colonyAddress = await kyodoInstance.colony();
    await tokenInstance.setOwner(colonyAddress);
  });
};
