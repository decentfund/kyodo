export const addNecessaryDomains = async kyodo => {
  // We have to add these domains due to hardcoded distribution by now
  const domainNames = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
  for (var i = 0; i < 4; i++) {
    await kyodo.addDomain(domainNames[i]);
  }
};

export const getDomainBalance = async (id, tokenAddress, colony) => {
  const { potId: domainPotId } = await colony.getDomain.call(id);
  const domainBalance = await colony.getPotBalance.call(
    domainPotId,
    tokenAddress,
  );
  return domainBalance.toNumber();
};
