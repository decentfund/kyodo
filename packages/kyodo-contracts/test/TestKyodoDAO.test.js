import truffleAssert from 'truffle-assertions';
import { shouldFail } from 'openzeppelin-test-helpers';
import { getTokenArgs } from '../lib/colonyNetwork/helpers/test-helper';
import { addNecessaryDomains, getDomainBalance } from '../helpers/test-helper';
import getColonyClient from '../migrations/getColonyClient';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const Registry = artifacts.require('Registry');
const KyodoDAO = artifacts.require('KyodoDAO');
const KyodoDAO_V1 = artifacts.require('KyodoDAO_V1');
const DomainsV1 = artifacts.require('DomainsV1');
const DomainsV2 = artifacts.require('DomainsV2');
const MembersV1 = artifacts.require('MembersV1');
const PeriodsV1 = artifacts.require('PeriodsV1');
const Token = artifacts.require('Token');
const EtherRouter = artifacts.require('EtherRouter');
const IColonyNetwork = artifacts.require('IColonyNetwork');
const IColony = artifacts.require('IColony');

contract('KyodoDAO', function([owner, anotherAccount]) {
  let colonyNetwork;
  let token;
  let kyodo;
  let domains;
  let periods;
  let members;
  let colony;

  before(async () => {
    const etherRouter = await EtherRouter.deployed();
    colonyNetwork = await IColonyNetwork.at(etherRouter.address);
  });
  beforeEach(async function() {
    const tokenArgs = getTokenArgs();
    token = await Token.new(...tokenArgs);
    token.mint(1000);
    kyodo = await KyodoDAO.new(owner);
    await kyodo.initialize(owner);
    const { logs } = await colonyNetwork.createColony(token.address);
    const { colonyAddress } = logs[0].args;
    domains = await DomainsV1.new();
    await domains.initialize(kyodo.address);
    periods = await PeriodsV1.new();
    await periods.initialize(kyodo.address);
    members = await MembersV1.new();
    await members.initialize(kyodo.address);
    await kyodo.setColonyAddress(colonyAddress);
    await kyodo.setTokenAddress(token.address);
    await kyodo.setDomainsAddress(domains.address);
    await kyodo.setPeriodsAddress(periods.address);
    await kyodo.setMembersAddress(members.address);
    await token.setOwner(colonyAddress);
    colony = await IColony.at(colonyAddress);
    await colony.setAdminRole(domains.address);
    await colony.setFounderRole(kyodo.address);
  });
  describe('sets alias', function() {
    describe('add alias', function() {
      it('reverts for unwhitelisted', async function() {
        await shouldFail(members.setAlias('aaa'));
      });
      it('reverts for existing nick', async function() {
        // FIXME: Implement single add to whitelist function in kyodo contract
        await kyodo.addManyToWhitelist([owner]);
        await members.setAlias('aaa');
        let usedAliases = await members.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
        await members.setAlias('bbb');
        usedAliases = await members.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
        await shouldFail(members.setAlias('bbb', { from: anotherAccount }));
        usedAliases = await members.getUsedAliasesLength();
        assert.equal(usedAliases, 1);
      });
      describe('finishes successfully for whitelisted and get', function() {
        let setAliasTx;
        beforeEach(async function() {
          await kyodo.addManyToWhitelist([owner]);
          const tx = await members.setAlias('aaa');
          setAliasTx = tx;
        });
        it('empty address', async function() {
          truffleAssert.eventEmitted(setAliasTx, 'NewAliasSet', ev => {
            return ev._address === owner && ev._alias === 'aaa';
          });
          const alias = await members.getAlias(anotherAccount, {
            from: anotherAccount,
          });
          assert.equal(alias, '');
        });
        it('proper alias', async function() {
          const alias = await members.getAlias(owner);
          assert.equal(alias, 'aaa');
        });
      });
      describe('alias setting', async function() {
        it('should allow to set back alias', async () => {
          await kyodo.addManyToWhitelist([owner]);
          const tx = await members.setAlias('igor');
          truffleAssert.eventEmitted(
            tx,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igor';
            },
            'should allow to set address for whitelisted',
          );
          let usedAliasesLength = await members.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not stored');
          const tx2 = await members.setAlias('igorz');
          truffleAssert.eventEmitted(
            tx2,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igorz';
            },
            'should allow to set another free alias for whitelisted',
          );
          usedAliasesLength = await members.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not deleted');
          const tx3 = await members.setAlias('igor');
          truffleAssert.eventEmitted(
            tx3,
            'NewAliasSet',
            ev => {
              return ev._address === owner && ev._alias === 'igor';
            },
            'should allow to set back original alias',
          );
          usedAliasesLength = await members.getUsedAliasesLength();
          assert.equal(usedAliasesLength, 1, 'Alias is not added');
        });
      });
    });
  });
  describe('initial distribution', function() {
    beforeEach(async function() {
      await kyodo.addManyToWhitelist([owner, anotherAccount]);
      await members.setAlias('aaa');
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
      const colonyMembers = await members.getMembersCount();
      assert.equal(colonyMembers, 2);
    });
    it('for empty whitelist', async function() {
      const colonyMembers = await members.getMembersCount();
      assert.equal(colonyMembers, 0);
    });
  });
  describe('sets period days length', function() {
    it('works', async function() {
      await kyodo.setPeriodDaysLength(4);
      let periodDaysLength = await periods.periodDaysLength();
      assert.equal(periodDaysLength, 4);
      await kyodo.setPeriodDaysLength(10);
      periodDaysLength = await periods.periodDaysLength();
      assert.equal(periodDaysLength, 10);
    });
  });
  describe('starts new period', function() {
    it('for new colony', async function() {
      // adding necessary domains
      await addNecessaryDomains(kyodo);

      const ownerRole = 0;
      let currentBlock = (await web3.eth.getBlock('latest')).number;

      let hasRole = await colony.hasUserRole(kyodo.address, ownerRole);
      let tokenOwner = await token.owner();
      assert(tokenOwner === colony.address, `${owner} is not token owner`);
      assert(hasRole, `${kyodo.address} does not have owner role`);

      let parentPotBalance = await getDomainBalance(1, token.address, colony);
      assert.equal(parentPotBalance, 0, 'parent domain pot is not empty');

      await kyodo.setPeriodDaysLength(1);
      const callback = () => {};
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86401], // 86400 seconds in a day
          id: new Date().getTime(),
        },
        callback,
      );

      currentBlock = (await web3.eth.getBlock('latest')).number;
      await kyodo.startNewPeriod();

      let totalSupply = await token.totalSupply();

      let currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock.toNumber(), currentBlock + 1);

      // Get the total supply of tokens
      totalSupply = await token.totalSupply();
      assert.equal(totalSupply.toNumber(), 1050);

      parentPotBalance = await getDomainBalance(1, token.address, colony);
      assert.equal(
        parentPotBalance,
        2,
        'parent domain pot is not empty after token distribution',
      );

      let firstDomainPotBalance = await getDomainBalance(
        2,
        token.address,
        colony,
      );
      assert.equal(
        firstDomainPotBalance,
        12,
        'first domain pot is not correct',
      );

      currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock.toNumber(), currentBlock + 1);

      const count = await colony.getDomainCount.call();
      assert.equal(count.toNumber(), 5, 'Should have 5 domains in colony');
    });
    it('reverts on immediate time new period start', async function() {
      // We have to add these domains due to hardcoded distribution by now
      const domainNames = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
      for (var i = 0; i < 4; i++) {
        await kyodo.addDomain(domainNames[i]);
      }

      await kyodo.startNewPeriod();
      await shouldFail(kyodo.startNewPeriod());
    });
    it('works after passing time', async function() {
      // We have to add these domains due to hardcoded distribution by now
      const domainNames = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
      for (var i = 0; i < 4; i++) {
        await kyodo.addDomain(domainNames[i]);
      }

      let domainsLength = await domains.getDomainsLength();
      assert.equal(domainsLength, 4, "Domains weren't added");

      let currentBlock = (await web3.eth.getBlock('latest')).number;

      await kyodo.startNewPeriod();
      let currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock, currentBlock + 1);
      await shouldFail(kyodo.startNewPeriod());

      await kyodo.setPeriodDaysLength(1);
      const callback = () => {};
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86401], // 86400 seconds in a day
          id: new Date().getTime(),
        },
        callback,
      );
      currentBlock = (await web3.eth.getBlock('latest')).number;

      await kyodo.startNewPeriod();
      currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock, currentBlock + 1);
    });
    it('works after period days length change', async function() {
      // We have to add these domains due to hardcoded distribution by now
      const domainNames = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
      for (var i = 0; i < 4; i++) {
        await kyodo.addDomain(domainNames[i]);
      }

      let currentBlock = (await web3.eth.getBlock('latest')).number;
      await kyodo.startNewPeriod();
      let currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock, currentBlock + 1);
      const callback = () => {};
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86400 * 29 + 1], // 86400 seconds in a day
          id: new Date().getTime(),
        },
        callback,
      );
      await kyodo.setPeriodDaysLength(45);
      await shouldFail(kyodo.startNewPeriod());
      await kyodo.setPeriodDaysLength(40);
      await shouldFail(kyodo.startNewPeriod());
      await web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [86401 * 11], // 86400 seconds in a day
          id: new Date().getTime(),
        },
        callback,
      );
      currentBlock = (await web3.eth.getBlock('latest')).number;
      await kyodo.startNewPeriod();
      currentPeriodStartBlock = await periods.currentPeriodStartBlock();
      assert.equal(currentPeriodStartBlock.toNumber(), currentBlock + 1);
    });
  });
  describe('domain adding', function() {
    it('works as expected', async function() {
      let domainsLength = await domains.getDomainsLength();
      assert.equal(domainsLength, 0, 'Domains are empty');

      const firstDomain = 'GOV';
      const secondDomain = 'FUND';

      let tx = await kyodo.addDomain(firstDomain);
      domainsLength = (await domains.getDomainsLength()).toNumber();
      assert.equal(
        domainsLength,
        1,
        'Domains length is not correct after adding of first domain',
      );
      let domain = await domains.getDomain(0);
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
      domainsLength = await domains.getDomainsLength();
      assert.equal(
        domainsLength,
        2,
        'Domains length is not correct after adding of second domain',
      );
      domain = await domains.getDomain(1);
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

    it('works correctly with array', async function() {
      let domainsLength = await domains.getDomainsLength();
      assert.equal(domainsLength, 0, 'Domains are empty');

      const firstDomain = 'GOV';
      const secondDomain = 'FUND';

      const domainsArray = [
        { code: 'GOV' },
        { code: 'FUND' },
        { code: 'SOCIAL' },
        { code: 'BUIDL' },
      ];

      const domainsCount = domainsArray.length;
      const txs = [];
      for (var i = 0; i < domainsCount; i++) {
        const tx = await kyodo.addDomain(domainsArray[i].code);
        txs.push(tx);
      }

      domainsLength = (await domains.getDomainsLength()).toNumber();
      assert.equal(
        domainsLength,
        4,
        'Domains length is not correct after adding of domains',
      );
      let domain = await domains.getDomain(0);
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

      truffleAssert.eventEmitted(txs[0], 'NewDomainAdded', ev => {
        return ev._code === firstDomain && ev._id.toNumber() === 1;
      });

      domain = await domains.getDomain(1);
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
      truffleAssert.eventEmitted(txs[1], 'NewDomainAdded', ev => {
        return ev._code === secondDomain && ev._id.toNumber() === 2;
      });
    });
  });
});

contract('KyodoDAO_V1', function([owner, anotherAccount]) {
  let colonyNetwork;
  let token;
  let kyodo;
  let domains;
  let periods;
  let members;
  let colony;

  before(async () => {
    const etherRouter = await EtherRouter.deployed();
    colonyNetwork = await IColonyNetwork.at(etherRouter.address);
  });
  beforeEach(async function() {
    const tokenArgs = getTokenArgs();
    token = await Token.new(...tokenArgs);
    token.mint(1000);
    kyodo = await KyodoDAO_V1.new(owner);
    await kyodo.initialize(owner);
    const { logs } = await colonyNetwork.createColony(token.address);
    const { colonyAddress } = logs[0].args;
    domains = await DomainsV2.new();
    await domains.initialize(kyodo.address);
    periods = await PeriodsV1.new();
    await periods.initialize(kyodo.address);
    members = await MembersV1.new();
    await members.initialize(kyodo.address);
    await kyodo.setColonyAddress(colonyAddress);
    await kyodo.setTokenAddress(token.address);
    await kyodo.setDomainsAddress(domains.address);
    await kyodo.setPeriodsAddress(periods.address);
    await kyodo.setMembersAddress(members.address);
    await token.setOwner(colonyAddress);
    colony = await IColony.at(colonyAddress);
    await colony.setAdminRole(domains.address);
    await colony.setFounderRole(kyodo.address);
  });

  it('add domain works as expected', async () => {
    let domainsLength = await domains.getDomainsLength();
    assert.equal(domainsLength.toNumber(), 0, 'Domains are not empty');
    await kyodo.addDomain('FUND');
    domainsLength = await domains.getDomainsLength();
    assert.equal(domainsLength, 1, 'Domain not added');

    await kyodo.addDomain('GOV');
    domainsLength = await domains.getDomainsLength();
    assert.equal(domainsLength, 2, 'Domain not added');

    const fundDomainDetails = await domains.getDomain('FUND');
    assert.equal(
      fundDomainDetails[1].toNumber(),
      2,
      'First created domain potId is wrong',
    );
    const govDomainDetails = await domains.getDomain('GOV');
    assert.equal(
      govDomainDetails[1].toNumber(),
      3,
      'Second created domain potId is wrong',
    );
  });

  it('create task', async () => {
    // adding domain
    await addNecessaryDomains(kyodo);

    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 1000);

    await kyodo.startNewPeriod();

    totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 1050);

    // creating task
    await kyodo.createTask(
      2,
      '0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231',
      10,
    );

    // checking tasks count
    const taskCount = await colony.getTaskCount();
    assert.equal(taskCount.toNumber(), 1, 'Task not added');

    // checking domain pot balance
    const domainBalance = await getDomainBalance(2, token.address, colony);
    assert.equal(domainBalance, 2, 'Domain balance has not changed');

    // get task
    const taskId = taskCount - 1;
    const task = await colony.getTask(taskId);
    // get task pot id
    const taskPotId = task.potId;

    // checking task pot balance
    const taskBalance = await colony.getPotBalance.call(
      taskPotId,
      token.address,
    );
    assert.equal(taskBalance, 10, 'Task pot was not funded');
  });

  describe('after migrations', () => {
    it('sets kyodo owner as colony admin', async () => {
      // Get Kyodo Proxy contract
      const registryDeployed = await Registry.deployed();
      const kyodoProxyAddress = await registryDeployed.getVersion('1.0');

      // Get Kyodo DAO V1 instance
      const kyodoInstance = await KyodoDAO_V1.at(kyodoProxyAddress);

      // Get colony address
      const colonyAddress = await kyodoInstance.colony();

      // Get colony client
      const colonyNetworkClient = getColonyClient('development', [
        owner,
        anotherAccount,
      ]);
      await colonyNetworkClient.init();
      const colonyClient = await colonyNetworkClient.getColonyClientByAddress(
        colonyAddress,
      );

      const { hasRole: hasAdminRole } = await colonyClient.hasUserRole.call({
        user: owner,
        role: 'ADMIN',
      });
      assert.equal(
        hasAdminRole,
        true,
        'Should set kyodo owner as colony admin',
      );
    });
  });
});
