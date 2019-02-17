const { BN } = require("bn.js");

export const convertAmount = (amount, decimals) => {
  const WAD = new BN(10).pow(new BN(parseInt(decimals)));
  return WAD.muln(parseFloat(amount)).toString();
};
