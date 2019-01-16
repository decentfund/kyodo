var tdr = require('truffle-deploy-registry');
var Token = artifacts.require('./Token.sol');

module.exports = async (deployer, network) => {
  const name = 'D E C E N T . F U N D';
  const symbol = 'DF';
  const decimals = 18;

  await deployer.deploy(Token, name, symbol, decimals);
  const tokenDeployed = await Token.deployed();
  if (!tdr.isDryRunNetworkName(network)) {
    await tdr.appendInstance(tokenDeployed);
  }
};
