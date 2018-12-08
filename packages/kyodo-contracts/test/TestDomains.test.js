import truffleAssert from 'truffle-assertions';
import encodeCall from '../helpers/encodeCall';
import { getTokenArgs } from '../lib/colonyNetwork/helpers/test-helper';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const EtherRouter = artifacts.require('EtherRouter');
const IColonyNetwork = artifacts.require('IColonyNetwork');
const IColony = artifacts.require('IColony');
const Token = artifacts.require('Token');
const DomainsV1 = artifacts.require('DomainsV1');
const DomainsV2 = artifacts.require('DomainsV2');
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy');

contract('Domains', function([owner]) {
  let proxy;
  const proxyInitData = encodeCall('initialize', ['address'], [owner]);
  beforeEach(async function() {
    proxy = await OwnedUpgradeabilityProxy.new();
  });
  describe('upgradability works', function() {
    it('to version 2', async function() {
      // Deploying version 1
      const domainsV1 = await DomainsV1.new(owner);
      await proxy.upgradeToAndCall(domainsV1.address, proxyInitData);

      const domainsV1Proxy = await DomainsV1.at(proxy.address);

      // Adding some domains
      await domainsV1Proxy.addDomain('FUND');
      await domainsV1Proxy.addDomain('GOV');
      await domainsV1Proxy.addDomain('SOCIAL');
      await domainsV1Proxy.addDomain('BUIDL');

      // Assert domains length
      let domainsLength = await domainsV1Proxy.getDomainsLength();
      assert.equal(domainsLength, 4);

      // Assert stored domains data
      const currentDomains = [];
      for (let i = 0; i < domainsLength; i++) {
        const storedDomain = await domainsV1Proxy.getDomain(i);
        const domain = {
          code: storedDomain[0],
          potId: storedDomain[1].toNumber(),
        };
        currentDomains.push(domain);
      }

      assert.deepEqual(currentDomains, [
        {
          code: 'FUND',
          potId: 1,
        },
        {
          code: 'GOV',
          potId: 2,
        },
        {
          code: 'SOCIAL',
          potId: 3,
        },
        {
          code: 'BUIDL',
          potId: 4,
        },
      ]);

      // Deploying version 2 and upgrading
      const domainsV2 = await DomainsV2.new(owner);

      await proxy.upgradeTo(domainsV2.address);

      const domainsV2Proxy = await DomainsV2.at(proxy.address);

      // Try to migrate data
      for (var i = 0; i < currentDomains.length; i++) {
        await domainsV2Proxy.addDomain(
          currentDomains[i].code,
          currentDomains[i].potId,
        );
      }

      // Assert domains length
      domainsLength = await domainsV2Proxy.getDomainsLength();
      assert.equal(domainsLength, 4);
    });
  });
});

contract('Domains V2', function([owner, anotherAccount]) {
  let domains;

  beforeEach(async () => {
    domains = await DomainsV2.new(owner);
  });

  it('has proper default values', async () => {
    const domainsLength = await domains.getDomainsLength();
    assert.equal(domainsLength, 0, 'Domains array is not empty');
  });

  it('adds new domain properly', async () => {
    const tx = await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    const domainsLength = (await domains.getDomainsLength()).toNumber();

    truffleAssert.eventEmitted(tx, 'NewDomainAdded');
    truffleAssert.eventEmitted(
      tx,
      'NewDomainAdded',
      ev => {
        return ev._code === 'FUND' && ev._id.toNumber() === 2;
      },
      'Should fire proper event on domain added',
    );

    assert.equal(domainsLength, 1, 'Domains length is not changed');
  });

  it('adds multiple domains', async () => {
    let tx = await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    truffleAssert.eventEmitted(tx, 'NewDomainAdded');
    truffleAssert.eventEmitted(
      tx,
      'NewDomainAdded',
      ev => {
        return ev._code === 'FUND' && ev._id.toNumber() === 2;
      },
      'Should fire proper event on domain added',
    );

    let domainsLength = (await domains.getDomainsLength()).toNumber();
    assert.equal(domainsLength, 1, 'Domains length is not changed');

    tx = await domains.addDomain('GOV', 11, {
      from: owner,
      gas: 500000,
    });

    truffleAssert.eventEmitted(tx, 'NewDomainAdded');
    truffleAssert.eventEmitted(
      tx,
      'NewDomainAdded',
      ev => {
        return ev._code === 'GOV' && ev._id.toNumber() === 11;
      },
      'Should fire proper event on domain added',
    );

    domainsLength = (await domains.getDomainsLength()).toNumber();
    assert.equal(domainsLength, 2, 'Domains length is not changed');
  });

  it("doesn't allow adding same domain name", async () => {
    await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    await truffleAssert.reverts(
      domains.addDomain('FUND', 3, {
        from: owner,
        gas: 500000,
      }),
      'domain-not-exist',
    );
  });

  it('allows changing domain pot id', async () => {
    await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    await domains.changeDomainPotId('FUND', 222, {
      from: owner,
      gas: 500000,
    });

    const domainDetails = await domains.getDomain('FUND');
    assert.equal(domainDetails[0], 'FUND');
    assert.equal(domainDetails[1].toNumber(), 222);
  });

  it("doesn't allow changing domain potId for non owner", async () => {
    await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    await truffleAssert.reverts(
      domains.changeDomainPotId('FUND', 222, {
        from: anotherAccount,
      }),
    );
  });

  it('returns domain details correctly', async () => {
    await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    const domainDetails = await domains.getDomain('FUND');
    assert.equal(domainDetails[0], 'FUND');
    assert.equal(domainDetails[1].toNumber(), 2);
  });

  it('should fail with version 1 addDomain call', async () => {
    await truffleAssert.reverts(domains.addDomain('FUND'), 'deprecated');
  });

  it('returns list of domain names', async () => {
    await domains.addDomain('FUND', 2, {
      from: owner,
      gas: 500000,
    });

    await domains.addDomain('GOV', 3, {
      from: owner,
      gas: 500000,
    });

    const domainNames = await domains.getDomainNames();
    assert.equal(domainNames, ['FUND', 'GOV']);
  });

  describe('distribute tokens correctly', () => {
    let colonyNetwork;
    let token;
    let colony;
    before(async () => {
      // setting up colony network
      const etherRouter = await EtherRouter.deployed();
      colonyNetwork = await IColonyNetwork.at(etherRouter.address);
    });
    beforeEach(async () => {
      // initing new token
      const tokenArgs = getTokenArgs();
      token = await Token.new(...tokenArgs);

      // creating new colony
      const { logs } = await colonyNetwork.createColony(token.address);
      const { colonyAddress } = logs[0].args;
      colony = await IColony.at(colonyAddress);
      await token.setOwner(colonyAddress);
      await colony.setAdminRole(domains.address);
      await colony.mintTokens(1000);
      await colony.claimColonyFunds(token.address);
    });
    it('when there are no domains', async () => {
      await domains.distributeTokens(colony.address, token.address, 1000);
    });
    it('with several domains', async () => {
      await colony.addDomain(1);
      await domains.addDomain('FUND', 2, {
        from: owner,
        gas: 500000,
      });
      await colony.addDomain(1);
      await domains.addDomain('GOV', 3, {
        from: owner,
        gas: 500000,
      });
      await colony.addDomain(1);
      await domains.addDomain('SOCIAL', 4, {
        from: owner,
        gas: 500000,
      });
      await domains.distributeTokens(colony.address, token.address, 1000);

      const fundDomainBalance = await colony.getPotBalance.call(
        2,
        token.address,
      );
      assert.equal(
        fundDomainBalance.toNumber(),
        333,
        'FUND domain pot balance is incorrect after distribution',
      );

      const govDomainBalance = await colony.getPotBalance.call(
        3,
        token.address,
      );
      assert.equal(
        govDomainBalance.toNumber(),
        333,
        'GOV domain pot balance is incorrect after distribution',
      );

      const socialDomainBalance = await colony.getPotBalance.call(
        4,
        token.address,
      );
      assert.equal(
        socialDomainBalance.toNumber(),
        333,
        'SOCIAL domain pot balance is incorrect after distribution',
      );
    });
  });
});
