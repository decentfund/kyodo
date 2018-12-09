import React from 'react';
import styled from 'styled-components';
import { FormattedPlural } from 'react-intl';
import moment from 'moment';
import PropTypes from 'prop-types';
import ProgressBar from './ProgressBar';

const StyledPeriodLabel = styled.span`
  font-family: Roboto Mono;
  font-weight: 300;
  font-size: 11px;

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

const StyledRelativeTime = styled.span`
  font-weight: 300;
`;

const PeriodProgress = ({ periodTitle, endTime, startTime, className }) => {
  const fraction = moment().diff(startTime) / endTime.diff(startTime);
  const daysLeft = moment(endTime).diff(moment.now(), 'days');

  return (
    <div style={{ marginBottom: 30 }} className={className}>
      <ProgressBar fraction={fraction} />
      <div style={{ marginTop: 3, textAlign: 'right' }}>
        <StyledPeriodLabel>current period</StyledPeriodLabel>
        <StyledPeriodName>{periodTitle}</StyledPeriodName>{' '}
        <StyledRelativeTime>
          {daysLeft} <FormattedPlural value={daysLeft} one="day" other="days" />{' '}
          left
        </StyledRelativeTime>
      </div>
    </div>
  );
};

PeriodProgress.propTypes = {
  periodTitle: PropTypes.string,
  endTime: PropTypes.instanceOf(moment),
  startTime: PropTypes.instanceOf(moment),
};

PeriodProgress.defaultProps = {
  periodTitle: 'Early Renaissance',
  endTime: moment(),
  startTime: moment(),
};

export default PeriodProgress;
