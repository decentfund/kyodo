import truffleAssert from 'truffle-assertions';
import { shouldFail } from 'openzeppelin-test-helpers';

require('chai')
  .use(require('chai-as-promised'))
  .should();

const MembersV1 = artifacts.require('MembersV1');
const MembersV2 = artifacts.require('MembersV2');

contract('Members', function([owner, anotherAccount]) {
  let members;
  beforeEach(async function() {
    members = await MembersV1.new(owner);
  });
  describe('sets alias', function() {
    describe('add alias', function() {
      it('reverts for unwhitelisted', async function() {
        await shouldFail(members.setAlias('aaa'));
      });
      it('reverts for existing nick', async function() {
        await members.addToWhitelist(owner);
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
          await members.addToWhitelist(owner);
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
          await members.addToWhitelist(owner);
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
});

contract('members V2', function([owner, anotherAccount]) {
  let members;
  beforeEach(async () => {
    members = await MembersV2.new(owner);
  });

  it('reverts for existing nick', async function() {
    await members.setAlias('aaa');
    let usedAliases = await members.getUsedAliasesLength();
    assert.equal(usedAliases, 1);
    await members.setAlias('bbb');
    usedAliases = await members.getUsedAliasesLength();
    assert.equal(usedAliases, 1);
    await shouldFail(
      members.setAlias('bbb', { from: anotherAccount }, 'alias-not-unique'),
    );
    usedAliases = await members.getUsedAliasesLength();
    assert.equal(usedAliases, 1);
  });
  it('should not allow to set empty alias for new user', async () => {
    await shouldFail.reverting.withMessage(
      members.setAlias(''),
      'prev-alias-not-set',
    );
  });
  it('should allow to unset alias', async () => {
    const tx = await members.setAlias('igor');
    truffleAssert.eventEmitted(
      tx,
      'NewAliasSet',
      ev => {
        return ev._address === owner && ev._alias === 'igor';
      },
      'should allow to set alias',
    );
    let usedAliasesLength = await members.getUsedAliasesLength();
    assert.equal(usedAliasesLength, 1, 'Alias is not stored in used aliases');
    let storedUserAlias = await members.getAlias(owner);
    assert.equal(storedUserAlias, 'igor', 'Alias is not stored');
    const tx2 = await members.setAlias('');
    truffleAssert.eventEmitted(
      tx2,
      'NewAliasSet',
      ev => {
        return ev._address === owner && ev._alias === '';
      },
      'should allow to set empty alias',
    );
    usedAliasesLength = await members.getUsedAliasesLength();
    assert.equal(
      usedAliasesLength,
      0,
      'Alias is not deleted from used aliases',
    );
    storedUserAlias = await members.getAlias(owner);
    assert.equal(storedUserAlias, '', 'Empty alias is not stored');
  });
});
