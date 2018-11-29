import { BASE_CURRENCY, LOAD_MULTISIG_BALANCE_SUCCESS } from '../constants';

export default (
  state = {
    [BASE_CURRENCY]: 0,
    ...process.env.BALANCE,
  },
  action,
) => {
  switch (action.type) {
    case LOAD_MULTISIG_BALANCE_SUCCESS:
      const tokenBalances = {};
      action.data.tokens.forEach(token => {
        const loadedBalance = token.balance / 10 ** token.tokenInfo.decimals;
        if (
          loadedBalance > state[token.tokenInfo.symbol] ||
          !state[token.tokenInfo.symbol]
        ) {
          tokenBalances[token.tokenInfo.symbol] =
            token.balance / 10 ** token.tokenInfo.decimals;
        }
      });
      return {
        ...state,
        ETH:
          !state.ETH || action.data.ETH.balance > state.ETH
            ? action.data.ETH.balance
            : state.ETH,
        ...tokenBalances,
      };
    default:
      return state;
  }
};
