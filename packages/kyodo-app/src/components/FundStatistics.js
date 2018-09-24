import React from 'react';
import styled from 'styled-components';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import StatisticsLabel from './StatisticsLabel';
import { FormattedEth, FormattedEur } from './FormattedCurrency';
import {
  getRate,
  getTotalSupply,
  getContract,
  getFundBaseBalance,
} from '../reducers';

const FundStatisticsContainer = styled.div`
  width: 160px;
  display: inline-block;
  padding-right: 10px;
`;

const FundStatistics = ({ balance, balanceEur, totalSupply }) => (
  <FundStatisticsContainer>
    <StatisticsLabel label="SUP">{totalSupply} tokens</StatisticsLabel>
    <StatisticsLabel label="CAP">
      <FormattedEth>{balance}</FormattedEth> ~
      <FormattedEur>{balanceEur}</FormattedEur>
    </StatisticsLabel>
    <StatisticsLabel label="1 ◯">
      <FormattedEth>{balance / totalSupply}</FormattedEth> ~
      <FormattedEur>{balanceEur / totalSupply}</FormattedEur>
    </StatisticsLabel>
    <StatisticsLabel label="FUND">
      <ContractData contract="KyodoDAO" method="getMembersCount" /> members
    </StatisticsLabel>
  </FundStatisticsContainer>
);

const mapStateToProps = state => {
  const balanceEur = getFundBaseBalance(state);
  return {
    balance: balanceEur / getRate(state, 'ETH', 'EUR'),
    balanceEur,
    totalSupply: getTotalSupply(getContract('Token')(state)),
  };
};

export default drizzleConnect(FundStatistics, mapStateToProps);
