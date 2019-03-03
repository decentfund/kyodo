export default (state = {}, action) => {
  switch (action.type) {
    case 'GET_POT_BALANCE_SUCCESS': {
      const { potId, potBalance: balance } = action.payload;
      return {
        ...state,
        [potId]: {
          ...state[potId],
          balance,
        },
      };
    }
    default:
      return state;
  }
};
