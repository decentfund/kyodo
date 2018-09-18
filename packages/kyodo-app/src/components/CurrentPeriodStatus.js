import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import dfToken from './dftoken.svg';
import { getRate, getContract } from '../reducers';
import { formatEth, formatEur, formatDecimals } from '../helpers/format';

const WrapperCurrentPeriodStatus = styled.div`
  border-top: 4px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-top: 10px;
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
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const { DecentToken, KyodoDAO } = this.contracts;
    const balanceKey = DecentToken.methods.balanceOf.cacheCall(
      this.props.colonyAddress,
    );
    const decimalsKey = DecentToken.methods.decimals.cacheCall();
    const currentPeriodStartTimeKey = KyodoDAO.methods.currentPeriodStartTime.cacheCall();
    const periodLengthKey = KyodoDAO.methods.periodDaysLength.cacheCall();

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
      !this.props.DecentToken.balanceOf[this.state.balanceKey] ||
      !this.state.decimalsKey ||
      !this.props.DecentToken.decimals[this.state.decimalsKey] ||
      !this.state.currentPeriodStartTimeKey ||
      !this.props.KyodoDAO.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ] ||
      !this.state.periodLengthKey ||
      !this.props.KyodoDAO.periodDaysLength[this.state.periodLengthKey]
    )
      return null;

    const {
      periodName,
      tokenPriceEUR,
      tokenPriceETH,
      tokenSymbol,
    } = this.props;

    const balance = formatDecimals(
      this.props.DecentToken.balanceOf[this.state.balanceKey].value,
      this.props.DecentToken.decimals[this.state.decimalsKey].value,
    );

    const periodStart = moment.unix(
      this.props.KyodoDAO.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ].value,
    );

    const periodEnd = moment(periodStart).add(
      this.props.KyodoDAO.periodDaysLength[this.state.periodLengthKey].value,
      'days',
    );

    return (
      <WrapperCurrentPeriodStatus>
        <StyledTop>
          {periodName}
          <Bounty>
            <Light>bounty</Light> <StyledTokenLogo src={dfToken} />
            {balance} {tokenSymbol}
          </Bounty>
        </StyledTop>
        <StyledBottom>
          <p>
            {periodStart.format('DD.MM.YYYY')} -{' '}
            {periodEnd.format('DD.MM.YYYY')}
          </p>
          <p>
            {formatEur(balance * tokenPriceEUR)}{' '}
            {formatEth(balance * tokenPriceETH)}
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
  periodName: PropTypes.string,
  DecentToken: PropTypes.object,
  KyodoDAO: PropTypes.object,
  tokenPriceEUR: PropTypes.number,
  tokenPriceETH: PropTypes.number,
};

CurrentPeriodStatus.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  DecentToken: getContract('DecentToken')(state),
  KyodoDAO: getContract('KyodoDAO')(state),
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
});

export default drizzleConnect(CurrentPeriodStatus, mapStateToProps);
