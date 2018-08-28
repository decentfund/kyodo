var KyodoDAO = artifacts.require('./KyodoDAO.sol');
var DecentToken = artifacts.require('./DecentToken.sol');
// var deployParameters = require('./deploy_parameters.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const Kyodo = KyodoDAO.at(KyodoDAO.address);

    // Starting new period
    await Kyodo.startNewPeriod();

    // Setting period lenght to 30 days
    await Kyodo.setPeriodDaysLength(30);

    // Minting new period bounty tokens
    const tokenInstance = DecentToken.at(DecentToken.address);
    const totalSupply = await tokenInstance.totalSupply();
    const colonyAddress = await Kyodo.Colony.call();
    await tokenInstance.mint(colonyAddress, totalSupply * 0.05);
  });
};
