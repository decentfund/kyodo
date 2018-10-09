async function getKyodoInstance(version, Registry, KyodoDAO) {
  const registry = await Registry.at(Registry.address);
  const kyodoAddress = await registry.getVersion(version);
  const kyodoInstance = KyodoDAO.at(kyodoAddress);

  return kyodoInstance;
}

module.exports = getKyodoInstance;
