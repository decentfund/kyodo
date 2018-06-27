import React from 'react';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import StatisticsLabel from './StatisticsLabel';
import { formatEth, formatEur } from '../helpers/format';
import { getRate } from '../reducers';

const FundStatistics = ({ balance, balanceEur }) => (
  <div>
    <StatisticsLabel label="SUP">
      <ContractData contract="DecentToken" method="totalSupply" /> tokens
    </StatisticsLabel>
    <StatisticsLabel label="CAP">
      {formatEth(balance)} {formatEur(balanceEur)}
    </StatisticsLabel>
    <StatisticsLabel label="1DF">
      {formatEth(0)} {formatEur(0)}
    </StatisticsLabel>
    <StatisticsLabel label="FUND">
      <ContractData contract="KyodoDAO" method="getMembersCount" /> members
    </StatisticsLabel>
  </div>
);

const mapStateToProps = state => {
  const balance = 0.5;
  return {
    balance,
    balanceEur: balance * getRate(state, 'ETH', 'EUR'),
  };
};

export default drizzleConnect(FundStatistics, mapStateToProps);
