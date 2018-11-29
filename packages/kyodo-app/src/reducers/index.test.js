import { getContract, getSymbol, getTotalSupply, getTokenBaseRate } from './';

const decentTokenContract = {
  totalSupply: {
    '0x0': {
      value: 100,
    },
  },
  symbol: {
    '0x0': {
      value: 'DECENT',
    },
  },
};

const state = {
  contracts: {
    DecentToken: decentTokenContract,
  },
  rates: {
    ETH: 400,
    EUR: 1,
  },
  balances: {
    EUR: 50,
  },
};

describe("Get's contract preop", function() {
  it('gets existing contract', () => {
    expect(getContract('DecentToken')(state)).toEqual(decentTokenContract);
  });
  it('returns undefined for not existing contract', () => {
    expect(getContract('RandomToken')(state)).toEqual(undefined);
  });
  it('returns undefined for empty state', () => {
    expect(getContract('RandomToken')({})).toEqual(undefined);
  });
});

describe('get token properties', function() {
  beforeEach(() => {
    this.tokenContract = decentTokenContract;
    this.randomContract = getContract('RandomToken')(state);
  });
  it('symbol', () => {
    expect(getSymbol(this.tokenContract)).toEqual('DECENT');
  });
  it('totalSupply', () => {
    expect(getTotalSupply(this.tokenContract)).toEqual(100);
  });
  it('returns empty string for non present contract', () => {
    expect(getSymbol(this.randomContract)).toEqual('');
  });
  it('returns 0 supply for non present contract', () => {
    expect(getTotalSupply(this.randomContract)).toEqual(0);
  });
});

describe('calculate token base rate', function() {
  beforeEach(() => {
    this.tokenContract = decentTokenContract;
    this.randomContract = getContract('RandomToken')(state);
  });
  it('for existing token', () => {
    expect(getTokenBaseRate(this.tokenContract)(state)).toEqual(0.5);
  });
  it('for unexisting token', () => {
    expect(getTokenBaseRate(this.randomContract)(state)).toEqual(0);
  });
});
