import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getCurrentPeriodInfo, getPointsDistribution } from '../reducers';

const Wrapper = styled.div`
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

class CurrentPeriodBalanceStatus extends Component {
  render() {
    const {
      currentPeriod: { initialBalance, periodTitle },
      usedTips,
    } = this.props;
    const fraction = initialBalance > 0 ? usedTips / initialBalance : 0;
    const inPercent = parseFloat(fraction * 100).toFixed(2);
    return (
      <Wrapper>
        {usedTips} of {initialBalance} points distributed in {periodTitle}
        <ProgressBarWrapper>
          <ProgressBar fraction={fraction} />
        </ProgressBarWrapper>
        <Percent>{inPercent}%</Percent>
      </Wrapper>
    );
  }
}

CurrentPeriodBalanceStatus.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  currentPeriod: getCurrentPeriodInfo(state),
  usedTips: getPointsDistribution(state).total,
});

export default drizzleConnect(CurrentPeriodBalanceStatus, mapStateToProps);
