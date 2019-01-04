var Token = artifacts.require('./Token.sol');
var Registry = artifacts.require('./Registry.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var getKyodoInstance = require('./getKyodoInstance');
var tokenInstance;
var deployParameters = require('./getDeployParameters');

const { BN } = require('bn.js');
const WAD = new BN(10).pow(new BN(18));

module.exports = async deployer => {
  const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO);
  tokenInstance = await Token.deployed();
  const { accounts: distAccounts } = deployParameters;
  // Minting initial distribution
  Object.keys(distAccounts).forEach(async address => {
    const amount = WAD.muln(distAccounts[address]);
    await tokenInstance.mint(amount);
    await tokenInstance.transfer(address, amount);
  });
  // Minting reserve tokens
  const totalToMint = Object.values(distAccounts).reduce(
    (acc, value) => acc + value,
  );
  const reserve = WAD.muln(totalToMint * 0.5);
  await tokenInstance.mint(reserve);
  // TODO: Transfer to multisig
  await tokenInstance.transfer(kyodoInstance.address, reserve);
  // Pass ownership to KyodoDAO
  const colonyAddress = await kyodoInstance.colony();
  await tokenInstance.setOwner(colonyAddress);
};
