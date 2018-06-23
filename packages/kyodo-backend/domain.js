const { initiateNetwork } = require("./network.js");
const { getColonyInstanceFromId } = require("./colony");
const { Domain } = require("./db.js");

exports.addDomain = async (req, res) => {
  // TODO: colonyClient integration
  const networkClient = await initiateNetwork();
  const colonyClient = await getColonyInstanceFromId(76);
  const parentDomain = await colonyClient.getDomain.call({ domainId: 1 });
  const domainCount = await colonyClient.getDomainCount.call();
  let newDomain = await colonyClient.addDomain.send({
    parentSkillId: parentDomain.localSkillId
  });
  let newlyCreatedDomain = await colonyClient.getDomain.call({
    domainId: domainCount.count + 1
  });

  console.log("DOMAIN COUNT       :", domainCount);
  console.log("PARENT DOMAIN      :", parentDomain);
  console.log("NEW DOMAIN         :", newDomain.eventData);
  console.log("NEW DOMAIN POT ID  :", newlyCreatedDomain.potId);

  let domain = new Domain({
    domainId: domainCount.count + 1,
    domainTitle: req.body.domainTitle,
    parentSkillId: newDomain.eventData.parentSkillId,
    localSkillId: newDomain.eventData.skillId,
    potId: newlyCreatedDomain.potId
  });

  domain.save((err, domain) => {
    if (err) return console.error(err);
  });
  res.end(`{"success" : Added ${domain} Successfully, "status" : 200}`);
};

exports.getAllDomains = async (req, res) => {
  let domains = await Domain.find((err, domains) => {
    if (err) return console.error(err);
    console.log(domains);
    res.send(`ALL DOMAINS: ${domains}`);
  });
};

exports.getDomainById = async (req, res) => {
  //TODO: find domain by ID from DB
};
