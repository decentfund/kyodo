const KyodoDAO_V1 = artifacts.require('./KyodoDAO_V1.sol');
const Registry = artifacts.require('./Registry.sol');
const getKyodoInstance = require('./getKyodoInstance');

module.exports = async deployer => {
  const kyodoInstance = await getKyodoInstance('1.0', Registry, KyodoDAO_V1);

  // Get Kyodo owner
  const kyodoOwner = await kyodoInstance.owner();

  // Setting kyodo owner colony admin
  await kyodoInstance.setColonyAdmin(kyodoOwner);
};
