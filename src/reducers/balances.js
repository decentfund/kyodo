import { BASE_CURRENCY, LOAD_MULTISIG_BALANCE_SUCCESS } from '../constants';

export default (
  state = {
    [BASE_CURRENCY]: 0,
  },
  action,
) => {
  switch (action.type) {
    case LOAD_MULTISIG_BALANCE_SUCCESS:
      const tokenBalances = {};
      action.data.tokens.map(
        token =>
          (tokenBalances[token.tokenInfo.symbol] = token.balance / 10 ** 18),
      );
      return {
        ...state,
        ETH: action.data.ETH.balance,
        ...tokenBalances,
      };
    default:
      return state;
  }
};
