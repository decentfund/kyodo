import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { getContract } from '../reducers';
import { withRouter, Route, NavLink } from 'react-router-dom';

import Menu from './Menu';
import Logo from './logo.svg';
import UserAlias from './UserAlias';
import Subnav from './Subnav';
import PeriodProgress from './PeriodProgress';

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0px 40px 20px 40px;
`;

const StyledColonyName = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const StyledMenuContainer = styled.div`
  margin-top: 34px;
  width: 100%;
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  line-height: normal;
  font-size: 20px;
  text-transform: uppercase;
  margin-left: 18px;
  line-height: 33px;
`;

const StyledMenu = styled(Menu)`
  margin-left: 26px;
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

class Header extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const currentPeriodStartTimeKey = this.contracts.KyodoDAO.methods.currentPeriodStartTime.cacheCall();
    const periodDaysLengthKey = this.contracts.KyodoDAO.methods.periodDaysLength.cacheCall();

    this.setState({ currentPeriodStartTimeKey, periodDaysLengthKey });
  }

  render() {
    if (
      !this.state.currentPeriodStartTimeKey ||
      !this.props.KyodoDAO.currentPeriodStartTime[
        this.state.currentPeriodStartTimeKey
      ] ||
      !this.state.periodDaysLengthKey ||
      !this.props.KyodoDAO.periodDaysLength[this.state.periodDaysLengthKey]
    )
      return null;

    const currentPeriodStartTime = this.props.KyodoDAO.currentPeriodStartTime[
      this.state.currentPeriodStartTimeKey
    ].value;

    const periodDaysLength = this.props.KyodoDAO.periodDaysLength[
      this.state.periodDaysLengthKey
    ].value;

    const { colonyName, userAddress } = this.props;
    return (
      <div>
        <StyledWrapper>
          <img src={Logo} />
          <StyledMenuContainer>
            <StyledColonyName href="/">{colonyName}</StyledColonyName>
            <StyledMenu />
            <StyledUserAlias to="/user">{userAddress}</StyledUserAlias>
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
        <StyledPeriodContainer>
          <StyledPeriodProgress
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
  colonyName: 'Colony Name',
  userAddress: '0x...',
};
Header.PropTypes = {
  colonyName: PropTypes.string,
  userAddress: PropTypes.string,
};
Header.contextTypes = {
  drizzle: PropTypes.object,
};
const mapStateToProps = state => ({
  KyodoDAO: getContract('KyodoDAO')(state),
});
export default withRouter(drizzleConnect(Header, mapStateToProps));
