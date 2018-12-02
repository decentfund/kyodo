import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getCurrentPeriodInfo } from '../reducers';

const Wrapper = styled.div``;

const Summary = styled.div`
  font-size: 24px;
`;

const ProgressBarWrapper = styled.div`
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 20px;
  height: 5px;
  background: white;
  overflow: hidden;
  width: 170px;
`;

const ProgressBar = styled.div`
  width: ${props => props.fraction * 100}%;
  border-right: 1px solid #000000;
  background: #bd6fd8;
  height: 5px;
`;

const Percent = styled.div`
  font-size: 11px;
  margin-top: 4px;
`;

const PeriodsDistribution = styled.div``;

class CurrentPeriodBalanceStatus extends Component {
  render() {
    const { currentPeriod } = this.props;
    const { currentBalance, initialBalance, periodTitle} = currentPeriod;
    const distributed = initialBalance - currentBalance;
    const fraction = (initialBalance > 0) ? distributed / initialBalance : 0;
    const inPercent = parseFloat(fraction * 100).toFixed(2);
    const total = 4800;

    const domainsData = [
      {title: 'BUILD', used: 743, unused: total - 743},
      {title: 'SOCIAL', used: 614, unused: total - 614},
      {title: 'FUND', used: 366, unused: total - 366},
      {title: 'GOV', used: 548, unused: total - 548},
    ];

    /*
    my thoughts about how to build figures:
    say, one 10x10 pixel block = 5 points
    we have 2000 pts in the BUIDL domain
    2000 pts = 400 blocks
    bar side size = square root of 400 = 20, which is integer, no problems
    then we have 1000 pts in the SOCIAL domain
    1000 pts = 200 blocks
    bar side size = square root of 200 = 14.14
    Math.round() to 14
    increase the first multiplier, then the second multiplier, until the result exceeds 200:
    15x14 = 210 blocks
    draw bar 15 by 14 blocks, remove 10 blocks in the end
    */

    return (
      <Wrapper>
        <Summary>
          {distributed} of {initialBalance} points distributed in {periodTitle}
          <ProgressBarWrapper>
            <ProgressBar fraction={fraction} />
          </ProgressBarWrapper>
          <Percent>{inPercent}%</Percent>
        </Summary>
        <PeriodsDistribution>
          {domainsData.map(data => (
            <div>{data.title}</div>
          ))}
        </PeriodsDistribution>
      </Wrapper>
    );
  }
}

CurrentPeriodBalanceStatus.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  currentPeriod: getCurrentPeriodInfo(state),
});

export default drizzleConnect(CurrentPeriodBalanceStatus, mapStateToProps);
