import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter, Route, NavLink } from 'react-router-dom';

import Menu from './Menu';
import Logo from './logo.svg';
import UserAlias from './UserAlias';
import Subnav from './Subnav';
import PeriodProgress from './PeriodProgress';
import FormattedAddress from './FormattedAddress';

import { loadCurrentPeriodInfo } from '../actions';
import { getContract, getCurrentPeriodInfo } from '../reducers';
import drizzleConnect from '../utils/drizzleConnect';

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0px 40px 20px 40px;
`;

const StyledColonyName = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
`;

const StyledMenuContainer = styled.div`
  margin-top: 34px;
  width: 100%;
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-size: 20px;
  margin-left: 18px;
  line-height: 33px;
`;

const StyledMenu = styled(Menu)`
  margin-left: 26px;
  text-transform: uppercase;
`;

const StyledPeriodContainer = styled.div`
  padding: 0 40px;
`;

const StyledPeriodProgress = styled(PeriodProgress)`
  width: 100%;
`;

const StyledUserAlias = styled(UserAlias)`
  right: 40px;
  top: 33px;
  position: absolute;
`;

const StyledFormattedAddress = styled(FormattedAddress)`
  display: inline;
`;

class Header extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  componentDidMount() {
    const currentPeriodStartTimeKey = this.contracts.Periods.methods.currentPeriodStartTime.cacheCall();
    const periodDaysLengthKey = this.contracts.Periods.methods.periodDaysLength.cacheCall();
    const kyodoNameKey = this.contracts.KyodoDAO.methods.name.cacheCall();
    const userAliasKey = this.contracts.Members.methods.getAlias.cacheCall(
      this.props.userAddress,
    );
    this.props.loadCurrentPeriodInfo();

    this.setState({
      currentPeriodStartTimeKey,
      periodDaysLengthKey,
      userAliasKey,
      kyodoNameKey,
    });
  }

  render() {
    if (
      !this.state.currentPeriodStartTimeKey ||
      !this.props.Periods.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ] ||
      !this.state.periodDaysLengthKey ||
      !this.props.Periods.periodDaysLength[this.state.periodDaysLengthKey] ||
      !this.state.userAliasKey ||
      !this.props.Members.getAlias[this.state.userAliasKey]
    )
      return null;

    const currentPeriodStartTime = this.props.Periods.currentPeriodStartTime[
      this.state.currentPeriodStartTimeKey
    ].value;

    const periodDaysLength = this.props.Periods.periodDaysLength[
      this.state.periodDaysLengthKey
    ].value;

    const alias = this.props.Members.getAlias[this.state.userAliasKey].value;
    const kyodoName =
      (this.props.KyodoDAO.name[this.state.kyodoNameKey] &&
        this.props.KyodoDAO.name[this.state.kyodoNameKey].value) ||
      'decent.fund';

    const { userAddress, currentPeriod = {} } = this.props;
    return (
      <div>
        <StyledWrapper>
          <img src={Logo} />
          <StyledMenuContainer>
            <StyledColonyName href="/">{kyodoName}</StyledColonyName>
            <StyledMenu />
            <StyledUserAlias to="/user">
              {alias ? (
                alias
              ) : (
                <StyledFormattedAddress>{userAddress}</StyledFormattedAddress>
              )}
            </StyledUserAlias>
          </StyledMenuContainer>
        </StyledWrapper>
        <Route
          path="(/|/stats)"
          render={({ match }) => (
            <Subnav>
              <NavLink to="/" exact>
                Fund
              </NavLink>
              {` 🞄 `}
              <NavLink to="/stats/tips" exact>
                Tips
              </NavLink>
              {` 🞄 `}
              <NavLink to="/stats/distribution" exact>
                Distribution
              </NavLink>
              {` 🞄 `}
              <NavLink to="/stats/leaderboard" exact>
                Leaderboard
              </NavLink>
              {` 🞄 `}
              <NavLink to="/stats/payouts" exact>
                Payouts
              </NavLink>
            </Subnav>
          )}
        />
        <StyledPeriodContainer>
          <StyledPeriodProgress
            {...currentPeriod}
            startTime={moment.unix(currentPeriodStartTime)}
            endTime={moment
              .unix(currentPeriodStartTime)
              .add(periodDaysLength, 'days')}
          />
        </StyledPeriodContainer>
      </div>
    );
  }
}
Header.defaultProps = { userAddress: '0x...' };
Header.propTypes = { userAddress: PropTypes.string };
Header.contextTypes = { drizzle: PropTypes.object };
const mapStateToProps = state => ({
  Periods: getContract('Periods')(state),
  KyodoDAO: getContract('KyodoDAO')(state),
  Members: getContract('Members')(state),
  currentPeriod: getCurrentPeriodInfo(state),
});
export default compose(
  withRouter,
  drizzleConnect,
  connect(
    mapStateToProps,
    { loadCurrentPeriodInfo },
  ),
)(Header);
