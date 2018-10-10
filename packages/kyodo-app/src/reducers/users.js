export default (state = { aliases: {} }, action) => {
  switch (action.type) {
    case 'GOT_CONTRACT_VAR':
      if (action.name === 'Members' && action.variable === 'getAlias') {
        return {
          ...state,
          aliases: {
            ...state.aliases,
            [action.args[0]]: action.value,
          },
        };
      }
      return state;
    default:
      return state;
  }
};
