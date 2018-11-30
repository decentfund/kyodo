import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { getContract, getCurrentPeriodInfo } from '../reducers';
import { loadCurrentPeriodInfo } from '../actions';
import { withRouter, Route, NavLink } from 'react-router-dom';

import Menu from './Menu';
import Logo from './logo.svg';
import UserAlias from './UserAlias';
import Subnav from './Subnav';
import PeriodProgress from './PeriodProgress';
import FormattedAddress from './FormattedAddress';

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
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const currentPeriodStartTimeKey = this.contracts.Periods.methods.currentPeriodStartTime.cacheCall();
    const periodDaysLengthKey = this.contracts.Periods.methods.periodDaysLength.cacheCall();
    const userAliasKey = this.contracts.Members.methods.getAlias.cacheCall(
      this.props.userAddress,
    );
    this.props.loadCurrentPeriodInfo();

    this.setState({
      currentPeriodStartTimeKey,
      periodDaysLengthKey,
      userAliasKey,
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

    const { colonyName, userAddress, currentPeriod = {} } = this.props;

    return (
      <div>
        <StyledWrapper>
          <img src={Logo} />
          <StyledMenuContainer>
            <StyledColonyName href="/">{colonyName}</StyledColonyName>
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
            </Subnav>
          )}
        />
        <Route
          path="(/|/members)"
          render={({ match }) => (
            <Subnav>
              <NavLink to="/members" exact>
                Members
              </NavLink>
              {` 🞄 `}
              <NavLink to="/members/balances" exact>
                Balances
              </NavLink>
            </Subnav>
          )}
        />
        <StyledPeriodContainer>
          <StyledPeriodProgress
            { ...currentPeriod }
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
Header.defaultProps = {
  colonyName: 'decent.fund',
  userAddress: '0x...',
};
Header.propTypes = {
  colonyName: PropTypes.string,
  userAddress: PropTypes.string,
};
Header.contextTypes = {
  drizzle: PropTypes.object,
};
const mapStateToProps = state => ({
  Periods: getContract('Periods')(state),
  Members: getContract('Members')(state),
  currentPeriod: getCurrentPeriodInfo(state),
});
export default withRouter(drizzleConnect(Header, mapStateToProps, { loadCurrentPeriodInfo }));
