import React from 'react';
import styled from 'styled-components';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import StatisticsLabel from './StatisticsLabel';
import { formatEth, formatEur } from '../helpers/format';
import { getRate, getTotalSupply, getContract } from '../reducers';

const FundStatisticsContainer = styled.div`
  width: 160px;
  display: inline-block;
  padding-right: 10px;
`;

const FundStatistics = ({ balance, balanceEur, totalSupply }) => (
  <FundStatisticsContainer>
    <StatisticsLabel label="SUP">
      <ContractData contract="DecentToken" method="totalSupply" /> tokens
    </StatisticsLabel>
    <StatisticsLabel label="CAP">
      {formatEth(balance)} ~{formatEur(balanceEur)}
    </StatisticsLabel>
    <StatisticsLabel label="1 ◯">
      {formatEth(balance / totalSupply)} ~{formatEur(balanceEur / totalSupply)}
    </StatisticsLabel>
    <StatisticsLabel label="FUND">
      <ContractData contract="KyodoDAO" method="getMembersCount" /> members
    </StatisticsLabel>
  </FundStatisticsContainer>
);

const mapStateToProps = state => {
  const balance = 0.5;
  return {
    balance,
    balanceEur: balance * getRate(state, 'ETH', 'EUR'),
    totalSupply: getTotalSupply(getContract('DecentToken')(state)),
  };
};

export default drizzleConnect(FundStatistics, mapStateToProps);
