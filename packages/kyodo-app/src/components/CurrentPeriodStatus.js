import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { compose } from 'redux';

import dfToken from './dftoken.svg';
import { FormattedEth, FormattedEur } from './FormattedCurrency';

import drizzleConnect from '../utils/drizzleConnect';
import { getRate, getContract } from '../reducers';
import { formatDecimals } from '../helpers/format';

const WrapperCurrentPeriodStatus = styled.div`
  border-top: 4px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;
const StyledTop = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 24px;
  line-height: 28px;
`;
const StyledBottom = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 16px;
  line-height: 19px;
`;
const Bounty = styled.div`
  display: flex;
  align-content: baseline;
  font-size: 24px;
  line-height: 28px;
  font-family: Roboto Mono;
`;
const Light = styled.span`
  color: rgba(0, 0, 0, 0.07);
`;
const StyledTokenLogo = styled.img`
  width: 24px;
  margin: 0 8px 0 8px;
`;

class CurrentPeriodStatus extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  componentDidMount() {
    const { Token, Periods } = this.contracts;
    const balanceKey = Token.methods.balanceOf.cacheCall(
      this.props.colonyAddress,
    );
    const decimalsKey = Token.methods.decimals.cacheCall();
    const currentPeriodStartTimeKey = Periods.methods.currentPeriodStartTime.cacheCall();
    const periodLengthKey = Periods.methods.periodDaysLength.cacheCall();

    this.setState({
      balanceKey,
      decimalsKey,
      currentPeriodStartTimeKey,
      periodLengthKey,
    });
  }

  render() {
    if (
      !this.state.balanceKey ||
      !this.props.Token.balanceOf[this.state.balanceKey] ||
      !this.state.decimalsKey ||
      !this.props.Token.decimals[this.state.decimalsKey] ||
      !this.state.currentPeriodStartTimeKey ||
      !this.props.Periods.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ] ||
      !this.state.periodLengthKey ||
      !this.props.Periods.periodDaysLength[this.state.periodLengthKey]
    )
      return null;

    const {
      periodName,
      tokenPriceEUR,
      tokenPriceETH,
      tokenSymbol,
    } = this.props;

    const balance = formatDecimals(
      this.props.Token.balanceOf[this.state.balanceKey].value,
      this.props.Token.decimals[this.state.decimalsKey].value,
    );

    const periodStart = moment.unix(
      this.props.Periods.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ].value,
    );

    const periodEnd = moment(periodStart).add(
      this.props.Periods.periodDaysLength[this.state.periodLengthKey].value,
      'days',
    );

    return (
      <WrapperCurrentPeriodStatus>
        <StyledTop>
          {periodName}
          <Bounty>
            <Light>bounty</Light> <StyledTokenLogo src={dfToken} />
            {balance}
            &thinsp;
            {tokenSymbol}
          </Bounty>
        </StyledTop>
        <StyledBottom>
          <p>
            {periodStart.format('DD.MM.YYYY')} -{' '}
            {periodEnd.format('DD.MM.YYYY')}
          </p>
          <p>
            <FormattedEur>{balance * tokenPriceEUR}</FormattedEur>{' '}
            <FormattedEth>{balance * tokenPriceETH}</FormattedEth>
          </p>
        </StyledBottom>
      </WrapperCurrentPeriodStatus>
    );
  }
}

CurrentPeriodStatus.defaultProps = {
  periodName: 'Early Renaissance',
};

CurrentPeriodStatus.propTypes = {
  drizzle: PropTypes.object,
  periodName: PropTypes.string,
  Token: PropTypes.object,
  Periods: PropTypes.object,
  tokenPriceEUR: PropTypes.number,
  tokenPriceETH: PropTypes.number,
};

const mapStateToProps = state => ({
  Token: getContract('Token')(state),
  Periods: getContract('Periods')(state),
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(CurrentPeriodStatus);
