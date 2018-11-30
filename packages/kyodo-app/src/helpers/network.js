export const getNetworkName = network => {
  switch (network) {
    case 1:
      return 'mainnet';
    case 2:
      return 'morden';
    case 3:
      return 'ropsten';
    case 4:
      return 'rinkeby';
    case 42:
      return 'kovan';
    case 5777:
      return 'private';
    default:
      return 'development';
  }
};
