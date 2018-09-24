var Token = artifacts.require('./Token.sol');

module.exports = deployer => {
  deployer.then(async () => {
    const name = 'D E C E N T . F U N D';
    const symbol = 'DF';
    const decimals = 18;
    await deployer.deploy(Token, name, symbol, decimals);
  });
};
