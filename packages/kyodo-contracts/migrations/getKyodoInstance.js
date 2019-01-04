// This won't work here as artifacts are only available in migrations
// var Registry = artifacts.require('./Registry.sol');
// var KyodoDAO = artifacts.require('./KyodoDAO.sol');

async function getKyodoInstance(version, Registry, KyodoDAO) {
  const registryDeployed = await Registry.deployed();
  const kyodoAddress = await registryDeployed.getVersion(version);
  const kyodoInstance = await KyodoDAO.at(kyodoAddress);

  return kyodoInstance;
}

module.exports = getKyodoInstance;
