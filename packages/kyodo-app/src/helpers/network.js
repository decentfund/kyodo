export const getNetworkName = (network) => {
  switch (network) {
    case 1: return 'Mainnet';
    case 2: return 'Morden';
    case 3: return 'Ropsten';
    case 4: return 'Rinkeby';
    case 42: return 'Kovan';
    case 5777: return 'Private';
    default: return 'Development';
  }
};
