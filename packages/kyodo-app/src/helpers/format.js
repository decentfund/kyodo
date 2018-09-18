const ETH = 'ETH';
const DAI = 'DAI';
const USD = 'USD';
const EUR = 'EUR';

export function formatCurrency(value, currency, precision = 0) {
  let decimalPoints = precision;
  if (!precision) {
    switch (currency) {
      case USD:
      case EUR:
      case DAI:
        decimalPoints = 2;
        break;
      case ETH:
        decimalPoints = 4;
        break;
      default:
        decimalPoints = 0;
    }
  }
  return parseFloat(
    Math.round(value * 10 ** decimalPoints) / 10 ** decimalPoints,
  );
}

export const formatEth = value => `${formatCurrency(value, ETH)} ETH`;
export const formatEur = value => `${formatCurrency(value, EUR)} €`;

export const formatDecimals = (value, decimals) =>
  value / Math.pow(10, decimals);
