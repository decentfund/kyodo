import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled, { injectGlobal } from 'styled-components';
// import Helloworld from './Helloworld.js';
import Header from './components/Header';
import AddRiotID from './components/AddRiotID';
import Members from './components/Members';
import MintTokens from './components/MintTokens';
import UserBalance from './components/UserBalance';
import PeriodProgress from './components/PeriodProgress';
import FundStatistics from './components/FundStatistics';
import CurrentPeriodStatus from './components/CurrentPeriodStatus';
import TotalSupplyChange from './components/TotalSupplyChange';
import {
  getContract,
  getOwner,
  getWhitelistedAddresses,
  getCurrentPeriodStartTime,
  getPeriodDaysLength,
} from './reducers';
import { loadRate, loadMultiSigBalance } from './actions';

injectGlobal`
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Roboto Mono", monospace;
}

button {
  font-family: "Roboto Mono", monospace;
  font-size: 16px;
}

/* Mozilla based browsers */
::-moz-selection {
   background-color: #f5f905;
   color: #000;
}

/* Works in Safari */
::selection {
   background-color: #f5f905;
   color: #000;
}

`;

const StyledMainInfoContainer = styled.div`
  display: block;
  padding: 0 40px;
  max-width: 665px;
`;

class App extends Component {
  state = {
    whitelistedAddresses: [],
  };

  constructor(props, context) {
    super(props);

    this.drizzle = context.drizzle;
  }

  componentDidMount() {
    this.props.loadRate(['ETH', ...Object.keys(process.env.BALANCE)]);
    this.props.loadMultiSigBalance();
  }

  addToWhitelist = () => {
    const { kyodoContract } = this.state;
    kyodoContract
      .addToWhitelist(this.state.address, {
        from: this.state.web3.eth.accounts[0],
      })
      .then(() => kyodoContract.getWhitelistedAddresses.call())
      .then(whitelistedAddresses => {
        this.setState({ whitelistedAddresses, address: '' });
      });
  };

  handleSaveNickName = name => {
    const {
      kyodoContract,
      web3: {
        eth: {
          accounts: [account],
        },
      },
    } = this.state;
    kyodoContract
      .setAlias(name, { from: account })
      .then(() => kyodoContract.getAlias.call(account))
      .then(nickname => this.setState({ nickname }));
    // .then(() => decentToken.balanceOf.call(account))
    // .then(balance =>
    // this.setState({
    // currentUserBalance: balance.toNumber(),
    // }),
    // );
  };

  render() {
    const { address } = this.state;
    const {
      userAddress,
      owner,
      whitelistedAddresses,
      currentPeriodStartTime,
      periodDaysLength,
    } = this.props;
    let prevBlock, colonyAddress;
    if (this.props.drizzleStatus.initialized) {
      this.drizzle.contracts.KyodoDAO.methods.owner.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.getWhitelistedAddresses.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.currentPeriodStartTime.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.periodDaysLength.cacheCall();

      this.prevBlockKey = this.drizzle.contracts.KyodoDAO.methods.currentPeriodStartBlock.cacheCall();
      this.tokenSymbolKey = this.drizzle.contracts.DecentToken.methods.symbol.cacheCall();
      this.colonyAddressKey = this.drizzle.contracts.KyodoDAO.methods.Colony.cacheCall();
    }

    if (
      this.prevBlockKey &&
      this.props.KyodoDAO.currentPeriodStartBlock[this.prevBlockKey]
    ) {
      prevBlock = this.props.KyodoDAO.currentPeriodStartBlock[this.prevBlockKey]
        .value;
    }

    if (
      this.colonyAddressKey &&
      this.props.KyodoDAO.Colony[this.prevBlockKey]
    ) {
      colonyAddress = this.props.KyodoDAO.Colony[this.colonyAddressKey].value;
    }

    const tokenSymbol =
      this.tokenSymbolKey &&
      this.props.DecentToken &&
      this.props.DecentToken.symbol[this.tokenSymbolKey] &&
      this.props.DecentToken.symbol[this.tokenSymbolKey].value;

    return (
      <div className="App">
        <Header userAddress={userAddress} />
        <StyledMainInfoContainer>
          <PeriodProgress
            startTime={moment.unix(currentPeriodStartTime)}
            endTime={moment
              .unix(currentPeriodStartTime)
              .add(periodDaysLength, 'days')}
          />
          <div style={{ marginBottom: 50 }}>
            <FundStatistics />
            <UserBalance contractName="DecentToken" account={userAddress} />
            {prevBlock ? <TotalSupplyChange prevBlock={prevBlock} /> : null}
          </div>
          <br />
          {prevBlock && colonyAddress ? (
            <CurrentPeriodStatus
              tokenSymbol={tokenSymbol}
              prevBlock={prevBlock}
              colonyAddress={colonyAddress}
            />
          ) : null}
          {whitelistedAddresses.indexOf(userAddress) >= 0 ? (
            <AddRiotID account={userAddress} />
          ) : null}
          {whitelistedAddresses.length > 0 || owner === userAddress ? (
            <Members
              canAdd={owner === userAddress}
              address={address}
              whitelistedAddresses={whitelistedAddresses}
            />
          ) : null}
          {owner === userAddress ? <MintTokens /> : null}
        </StyledMainInfoContainer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
  KyodoDAO: getContract('KyodoDAO')(state),
  DecentToken: getContract('DecentToken')(state),
  drizzleStatus: state.drizzleStatus,
  owner: getOwner(getContract('KyodoDAO')(state)),
  whitelistedAddresses: getWhitelistedAddresses(getContract('KyodoDAO')(state)),
  currentPeriodStartTime: getCurrentPeriodStartTime(
    getContract('KyodoDAO')(state),
  ),
  periodDaysLength: getPeriodDaysLength(getContract('KyodoDAO')(state)),
});

App.contextTypes = {
  drizzle: PropTypes.object,
};

export default drizzleConnect(App, mapStateToProps, {
  loadRate,
  loadMultiSigBalance,
});
