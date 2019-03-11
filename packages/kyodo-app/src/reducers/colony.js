export default (
  state = {
    pots: {},
    domains: [],
  },
  action,
) => {
  switch (action.type) {
    case 'GET_COLONY_NETWORK_CLIENT_REQUEST':
      return {
        ...state,
        networkClientLoading: true,
      };
    case 'GET_COLONY_NETWORK_CLIENT_SUCCESS':
      return {
        ...state,
        networkClient: action.payload,
        networkClientLoading: false,
      };
    case 'GET_COLONY_REQUEST':
      return {
        ...state,
        clientLoading: true,
      };
    case 'GET_COLONY_SUCCESS':
      return {
        ...state,
        client: action.payload,
        clientLoading: false,
      };
    case 'GET_DOMAINS_SUCCESS':
      return {
        ...state,
        domains: action.payload,
      };
    default:
      return state;
  }
};
