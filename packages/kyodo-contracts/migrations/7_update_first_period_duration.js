var KyodoDAO = artifacts.require("./KyodoDAO.sol");
var Registry = artifacts.require("./Registry.sol");
var getKyodoInstance = require("./getKyodoInstance");

module.exports = deployer => {
  deployer.then(async () => {
    const kyodoInstance = await getKyodoInstance("1.0", Registry, KyodoDAO);

    // Setting period lenght to 30 days
    await kyodoInstance.setPeriodDaysLength(45);
  });
};
