import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const KyodoDAO = artifacts.require('KyodoDAO');
const MintableToken = artifacts.require('MintableToken');

contract('KyodoDAO', function([owner, anotherAccount]) {
  beforeEach(async function() {
    this.token = await MintableToken.new({ from: owner });
    this.kyodo = await KyodoDAO.new(this.token.address);
    await this.token.transferOwnership(this.kyodo.address);
  });
  describe('sets alias', function() {
    describe('add alias', function() {
      it('reverts for unwhitelisted', async function() {
        await assertRevert(this.kyodo.setAlias('aaa'));
      });
      it('reverts for existing nick', async function() {
        await this.kyodo.addToWhitelist(owner);
        this.kyodo.setAlias('aaa');
        this.kyodo.setAlias('bbb');
        await assertRevert(this.kyodo.setAlias('aaa'));
      });
      describe('finishes successfully for whitelisted and get', function() {
        beforeEach(async function() {
          await this.kyodo.addToWhitelist(owner);
          await this.kyodo.setAlias('aaa');
        });
        it('empty address', async function() {
          const alias = await this.kyodo.getAlias(anotherAccount, {
            from: anotherAccount,
          });
          assert.equal(alias, '');
        });
        it('proper alias', async function() {
          const alias = await this.kyodo.getAlias(owner);
          assert.equal(alias, 'aaa');
        });
      });
    });
  });
  describe('initial distribution', function() {
    beforeEach(async function() {
      await this.kyodo.addManyToWhitelist([owner, anotherAccount]);
      await this.kyodo.setAlias('aaa');
    });
    it('happen on start called by owner', async function() {
      let totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, 100000);
      const userBalance = await this.token.balanceOf(owner);
      assert.equal(userBalance, 100000);
      await this.kyodo.setAlias('bbb', { from: anotherAccount });
      totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, 200000);
      const user2Balance = await this.token.balanceOf(anotherAccount);
      assert.equal(user2Balance, 100000);
    });
  });
  describe('returns proper members count', function() {
    it('for 2 whitelisted addresses', async function() {
      await this.kyodo.addManyToWhitelist([owner, anotherAccount]);
      const colonyMembers = await this.kyodo.getMembersCount();
      assert.equal(colonyMembers, 2);
    });
    it('for empty whitelist', async function() {
      const colonyMembers = await this.kyodo.getMembersCount();
      assert.equal(colonyMembers, 0);
    });
  });
});
