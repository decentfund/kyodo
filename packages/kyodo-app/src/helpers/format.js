export const ETH = 'ETH';
export const DAI = 'DAI';
export const USD = 'USD';
export const EUR = 'EUR';

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
