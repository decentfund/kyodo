export const formatTipsPerDomain = tips =>
  tips.reduce(
    (memo, { domain, amount }) => {
      if (memo[domain]) {
        memo[domain] = memo[domain] + amount;
      } else {
        memo[domain] = amount;
      }

      memo.total += amount;
      return memo;
    },
    { total: 0 }
  );
