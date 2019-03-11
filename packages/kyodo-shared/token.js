const { BN } = require("bn.js");

/**
 * Converting string amount and decimals to BN string value
 * @param {string} amount
 * @param {string} decimals
 * @return {string}
 */
export const convertAmount = (amount, decimals) => {
  const WAD = new BN(10).pow(new BN(parseInt(decimals)));
  return WAD.muln(parseFloat(amount));
};
