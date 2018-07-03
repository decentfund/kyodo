import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import PropTypes from 'prop-types';
import ProgressBar from './ProgressBar';

const StyledPeriodContainer = styled.div`
  float: left;
`;

const StyledPeriodLabel = styled.span`
  font-family: Roboto Mono;
  font-weight: 300;
  font-size: 12px;

  &::after {
    content: ':';
    margin-right: 7px;
  }
`;

const StyledPeriodName = styled.span`
  font-family: Roboto Mono;
  font-weight: 500;
  font-size: 12px;
  text-align: right;
`;

const StyledRelativeTime = styled.div`
  text-align: right;
`;

const PeriodProgress = ({ periodName, endTime, startTime }) => {
  const fraction = moment().diff(startTime) / endTime.diff(startTime);

  return (
    <div>
      <div style={{ marginBottom: 3 }}>
        <StyledPeriodContainer>
          <StyledPeriodLabel>current period</StyledPeriodLabel>
          <StyledPeriodName>{periodName}</StyledPeriodName>
        </StyledPeriodContainer>
        <StyledRelativeTime>{moment().to(endTime)}</StyledRelativeTime>
      </div>
      <ProgressBar fraction={fraction} />
    </div>
  );
};

PeriodProgress.propTypes = {
  periodName: PropTypes.string,
  endTime: moment,
  startTime: moment,
};

PeriodProgress.defaultProps = {
  periodName: 'Early Renaissance',
  endTime: moment(),
  startTime: moment(),
};

export default PeriodProgress;
