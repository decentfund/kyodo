import { Domain } from './db.js';

export const dbAddDomain = async ({
  id,
  title,
  parentSkillId,
  localSkillId,
  potId,
}) => {
  let domain = new Domain({
    domainId: id,
    domainTitle: title,
    parentSkillId,
    localSkillId,
    potId,
  });

  await domain.save(err => {
    if (err) return console.error(err);
  });

  return domain;
};

export const getAllDomains = async () => {
  return await Domain.find();
};

export const getDomainById = async (req, res) => {
  //TODO: find domain by ID from DB
};

export const getPointTypes = async () => {
  const domains = await Domain.find();
  const pointTypes = domains.map(d => d.domainTitle);
  return pointTypes;
};
