var tdr = require('truffle-deploy-registry');
var Token = artifacts.require('./Token.sol');

module.exports = (deployer, network) => {
  deployer.then(async () => {
    const name = 'D E C E N T . F U N D';
    const symbol = 'DF';
    const decimals = 18;

    const tokenInstance = await deployer.deploy(Token, name, symbol, decimals);
    if (!tdr.isDryRunNetworkName(network)) {
      await tdr.appendInstance(tokenInstance);
    }
  });
};
