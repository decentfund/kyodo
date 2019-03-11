import BN from 'bn.js';

import { shouldFail, expectEvent } from 'openzeppelin-test-helpers';
const PeriodsV2 = artifacts.require('PeriodsV2');

contract('Periods V2', function([owner, anotherAccount]) {
  let periods;
  beforeEach(async function() {
    periods = await PeriodsV2.new(owner);
  });

  it('set period name and start new period with proper event', async () => {
    const name = 'Suffering Middle Age';
    const setPeriodNameTx = await periods.setPeriodName(name);
    expectEvent.inLogs(setPeriodNameTx.logs, 'PeriodNameSet', {
      _periodName: name,
    });

    const startNewPeriodTx = await periods.startNewPeriod();
    expectEvent.inLogs(startNewPeriodTx.logs, 'NewPeriodStart', {
      _periodId: new BN(0),
      _periodName: name,
    });

    await periods.setPeriodDaysLength(1);

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

    const newPeriodName = 'Early Renaissance';
    const setPeriodNameTx2 = await periods.setPeriodName(newPeriodName);
    expectEvent.inLogs(setPeriodNameTx2.logs, 'PeriodNameSet', {
      _periodName: newPeriodName,
    });

    const startNewPeriodTx2 = await periods.startNewPeriod();
    expectEvent.inLogs(startNewPeriodTx2.logs, 'NewPeriodStart', {
      _periodId: new BN(1),
      _periodName: newPeriodName,
    });
  });

  it('reverts for previous method start new period', async () => {
    await shouldFail(periods.startNewPeriod('0x0', '0x0'), 'deprecated');
  });

  it('only owner can set period name', async () => {
    await shouldFail(
      periods.methods['setPeriodName(string)']('some name', {
        from: anotherAccount,
      }),
    );
  });
});
