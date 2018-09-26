import truffleAssert from 'truffle-assertions';
import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';
import { getTokenArgs } from '../lib/colonyNetwork/helpers/test-helper';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const KyodoDAO = artifacts.require('KyodoDAO');
const Token = artifacts.require('Token');
const EtherRouter = artifacts.require('EtherRouter');
const IColonyNetwork = artifacts.require('IColonyNetwork');
const IColony = artifacts.require('IColony');
const Authority = artifacts.require('Authority');

contract('KyodoDAO', function([owner, anotherAccount]) {
  let colonyNetwork;
  let token;
  let kyodo;
  let colony;
  let authority;

  const domainBalance = async (id, tokenAddress, colony) => {
    const [, domainPotId] = await colony.getDomain.call(id);
    const domainBalance = await colony.getPotBalance.call(
      domainPotId,
      tokenAddress,
    );
    return domainBalance.toNumber();
  };

  before(async () => {
    const etherRouter = await EtherRouter.deployed();
    colonyNetwork = await IColonyNetwork.at(etherRouter.address);
  });
  beforeEach(async function() {
    const tokenArgs = getTokenArgs();
    token = await Token.new(...tokenArgs);
    token.mint(1000);
    kyodo = await KyodoDAO.new(token.address);
    const { logs } = await colonyNetwork.createColony(token.address);
    const { colonyAddress } = logs[0].args;
    await kyodo.setColonyAddress(colonyAddress);
    await token.setOwner(colonyAddress);
    colony = await IColony.at(colonyAddress);
    const authorityAddress = await colony.authority();
    authority = await Authority.at(authorityAddress);
    for (var i = 0; i < 4; i++) {
      await colony.addDomain(1);
    }
    await colony.setOwnerRole(kyodo.address);
  });
  describe('sets alias', function() {
    describe('add alias', function() {
      it('reverts for unwhitelisted', async function() {
        await assertRevert(kyodo.setAlias('aaa'));
      });
      it('reverts for existing nick', async function() {
        await kyodo.addToWhitelist(owner);
        await kyodo.setAlias('aaa');
        let usedAliases = await kyodo.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
        await kyodo.setAlias('bbb');
        usedAliases = await kyodo.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
        await assertRevert(kyodo.setAlias('bbb', { from: anotherAccount }));
        usedAliases = await kyodo.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
      });
      describe('finishes successfully for whitelisted and get', function() {
        let setAliasTx;
        beforeEach(async function() {
          await kyodo.addToWhitelist(owner);
          const tx = await kyodo.setAlias('aaa');
          setAliasTx = tx;
        });
        it('empty address', async function() {
          truffleAssert.eventEmitted(setAliasTx, 'NewAliasSet', ev => {
            return ev._address === owner && ev._alias === 'aaa';
          });
          const alias = await kyodo.getAlias(anotherAccount, {
            from: anotherAccount,
          });
          assert.equal(alias, '');
        });
        it('proper alias', async function() {
          const alias = await kyodo.getAlias(owner);
          assert.equal(alias, 'aaa');
        });
      });
      describe('alias setting', async function() {
        it('should allow to set back alias', async () => {
          await kyodo.addToWhitelist(owner);
          const tx = await kyodo.setAlias('igor');
          truffleAssert.eventEmitted(
            tx,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igor';
            },
            'should allow to set address for whitelisted',
          );
          let usedAliasesLength = await kyodo.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not stored');
          const tx2 = await kyodo.setAlias('igorz');
          truffleAssert.eventEmitted(
            tx2,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igorz';
            },
            'should allow to set another free alias for whitelisted',
          );
          usedAliasesLength = await kyodo.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not deleted');
          const tx3 = await kyodo.setAlias('igor');
          truffleAssert.eventEmitted(
            tx3,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igor';
            },
            'should allow to set back original alias',
          );
          usedAliasesLength = await kyodo.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not added');
        });
      });
    });
  });
  describe('initial distribution', function() {
    beforeEach(async function() {
      await kyodo.addManyToWhitelist([owner, anotherAccount]);
      await kyodo.setAlias('aaa');
    });
    // it('happen on start called by owner', async function() {
    // let totalSupply = await this.token.totalSupply();
    // assert.equal(totalSupply, 100000);
    // const userBalance = await this.token.balanceOf(owner);
    // assert.equal(userBalance, 100000);
    // await kyodo.setAlias('bbb', { from: anotherAccount });
    // totalSupply = await this.token.totalSupply();
    // assert.equal(totalSupply, 200000);
    // const user2Balance = await this.token.balanceOf(anotherAccount);
    // assert.equal(user2Balance, 100000);
    // });
  });
  describe('returns proper members count', function() {
    it('for 2 whitelisted addresses', async function() {
      await kyodo.addManyToWhitelist([owner, anotherAccount]);
      const colonyMembers = await kyodo.getMembersCount();
      assert.equal(colonyMembers, 2);
    });
    it('for empty whitelist', async function() {
      const colonyMembers = await kyodo.getMembersCount();
      assert.equal(colonyMembers, 0);
    });
  });
  describe('sets period days length', function() {
    it('works', async function() {
      await kyodo.setPeriodDaysLength(4);
      let periodDaysLength = await kyodo.periodDaysLength();
      assert.equal(periodDaysLength, 4);
      await kyodo.setPeriodDaysLength(10);
      periodDaysLength = await kyodo.periodDaysLength();
      assert.equal(periodDaysLength, 10);
    });
  });
  describe('starts new period', function() {
    it('for new colony', async function() {
      const ownerRole = 0;
      const currentBlock = await web3.eth.getBlock('latest').number;

      let hasRole = await authority.hasUserRole(kyodo.address, ownerRole);
      let tokenOwner = await token.owner();
      assert(tokenOwner === colony.address, `${owner} is not token owner`);
      assert(hasRole, `${kyodo.address} does not have owner role`);

      let parentPotBalance = await domainBalance(1, token.address, colony);
      assert.equal(parentPotBalance, 0, 'parent domain pot is not empty');

      await kyodo.startNewPeriod();

      // Get the total supply of tokens
      let totalSupply = await token.totalSupply();
      assert.equal(totalSupply.toNumber(), 1050);

      parentPotBalance = await domainBalance(1, token.address, colony);
      assert.equal(
        parentPotBalance,
        2,
        'parent domain pot is not empty after token distribution',
      );

      let firstDomainPotBalance = await domainBalance(2, token.address, colony);
      assert.equal(
        firstDomainPotBalance,
        12,
        'first domain pot is not correct',
      );

      const currentPeriodStartBlock = await kyodo.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock.toNumber(), currentBlock + 1);

      const count = await colony.getDomainCount.call();
      assert.equal(count.toNumber(), 5, 'Should have 5 domains in colony');
    });
    it('reverts on immediate time new period start', async function() {
      await kyodo.startNewPeriod();
      await assertRevert(kyodo.startNewPeriod());
    });
    it('works after passing time', async function() {
      let currentBlock = await web3.eth.getBlock('latest').number;
      await kyodo.startNewPeriod();
      let currentPeriodStartBlock = await kyodo.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock, currentBlock + 1);
      await assertRevert(kyodo.startNewPeriod());
      await kyodo.setPeriodDaysLength(1);
      const callback = () => {};
      await web3.currentProvider.sendAsync(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86401], // 86400 seconds in a day
          id: new Date().getTime(),
        },
        callback,
      );
      currentBlock = await web3.eth.getBlock('latest').number;
      await kyodo.startNewPeriod();
      currentPeriodStartBlock = await kyodo.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock, currentBlock + 1);
    });
  });
  describe('domain adding', function() {
    it('works as expected', async function() {
      let domainsLength = await kyodo.getDomainsLength();
      assert.equal(domainsLength, 0, 'Domains are empty');

      const firstDomain = 'GOV';
      const secondDomain = 'FUND';

      let tx = await kyodo.addDomain(firstDomain);
      domainsLength = await kyodo.getDomainsLength();
      assert.equal(
        domainsLength,
        1,
        'Domains length is not correct after adding of first domain',
      );
      let domain = await kyodo.getDomain(0);
      assert.equal(
        domain[0],
        firstDomain,
        'First domain code is stored incorrectly',
      );
      assert.equal(
        domain[1].toNumber(),
        1,
        'First domain id is stored incorrectly',
      );
      truffleAssert.eventEmitted(tx, 'NewDomainAdded', ev => {
        return ev._code === firstDomain && ev._id.toNumber() === 1;
      });

      tx = await kyodo.addDomain(secondDomain);
      domainsLength = await kyodo.getDomainsLength();
      assert.equal(
        domainsLength,
        2,
        'Domains length is not correct after adding of second domain',
      );
      domain = await kyodo.getDomain(1);
      assert.equal(
        domain[0],
        secondDomain,
        'Second domain code is stored incorrectly',
      );
      assert.equal(
        domain[1].toNumber(),
        2,
        'Second domain id is stored incorrectly',
      );
      truffleAssert.eventEmitted(tx, 'NewDomainAdded', ev => {
        return ev._code === secondDomain && ev._id.toNumber() === 2;
      });
    });
  });
});
