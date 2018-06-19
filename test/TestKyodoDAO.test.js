import assertRevert from 'openzeppelin-solidity/test/helpers/assertRevert';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const KyodoDAO = artifacts.require('KyodoDAO');

contract('KyodoDAO', function(accounts) {
  describe('sets alias', function() {
    beforeEach(async function() {
      this.kyodo = await KyodoDAO.new();
    });
    describe('add alias', function() {
      it('reverts for unwhitelisted', async function() {
        await assertRevert(this.kyodo.setAlias('aaa'));
      });
      describe('finishes successfully for whitelisted and get', function() {
        beforeEach(async function() {
          await this.kyodo.addToWhitelist(accounts[0]);
          await this.kyodo.setAlias('aaa');
        });
        it('empty address', async function() {
          const alias = await this.kyodo.getAlias('ab');
          assert.equal(alias, ZERO_ADDRESS);
        });
        it('proper alias', async function() {
          const alias = await this.kyodo.getAlias('aaa');
          assert.equal(alias, accounts[0]);
        });
      });
    });
  });
});
