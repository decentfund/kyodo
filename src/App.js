import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled, { injectGlobal } from 'styled-components';
// import Helloworld from './Helloworld.js';
import Nickname from './Nickname';
import Header from './components/Header';
import Members from './components/Members';
import MintTokens from './components/MintTokens';
import UserBalance from './components/UserBalance';
import PeriodProgress from './components/PeriodProgress';
import FundStatistics from './components/FundStatistics';
import DecentToken from '../build/contracts/DecentToken.json';
import KyodoDAO from '../build/contracts/KyodoDAO.json';
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
      decentToken,
      web3: { eth: { accounts: [account] } },
    } = this.state;
    kyodoContract
      .setAlias(name, { from: account })
      .then(() => kyodoContract.getAlias.call(account))
      .then(nickname => this.setState({ nickname }))
      .then(() => decentToken.balanceOf.call(account))
      .then(balance =>
        this.setState({
          currentUserBalance: balance.toNumber(),
        }),
      );
  };

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const decentToken = contract(DecentToken);
    decentToken.setProvider(this.state.web3.currentProvider);

    const kyodoDAO = contract(KyodoDAO);
    kyodoDAO.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    // var simpleStorageInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const tokenContract = await decentToken.deployed();
      const totalSupply = await tokenContract.totalSupply();
      const currentUserBalance = await tokenContract.balanceOf(accounts[0]);
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();

      const kyodoContract = await kyodoDAO.deployed();
      const whitelistedAddresses = await kyodoContract.getWhitelistedAddresses.call();
      const owner = await kyodoContract.owner.call();

      const nick = await kyodoContract.getAlias.call(accounts[0]);
      console.log(nick);

      this.setState({
        totalSupply: totalSupply.toNumber(),
        currentUserBalance: currentUserBalance.toNumber(),
        tokenName,
        tokenSymbol,
        whitelistedAddresses,
        kyodoContract,
        owner,
        nickname: nick,
      });
      // decentToken
      // .deployed()
      // .then(instance => {
      // console.log(instance);
      // return instance.balanceOf(0x0);
      // // simpleStorageInstance = instance;
      // // Stores a given value, 5 by default.
      // // return simpleStorageInstance.set(5, { from: accounts[0] });
      // })
      // .then(result => {
      // console.log(result);
      // // Get the value from the contract to prove it worked.
      // // return simpleStorageInstance.get.call(accounts[0]);
      // })
      // .then(result => {
      // // Update state with the result.
      // // return this.setState({ storageValue: result.c[0] });
      // });
    });
  }
  render() {
    return <div />;
    const { address, tokenName } = this.state;
    const {
      accounts: { 0: userAddress },
      owner,
      whitelistedAddresses,
      currentPeriodStartTime,
      periodDaysLength,
    } = this.props;
    if (this.props.drizzleStatus.initialized) {
      this.drizzle.contracts.KyodoDAO.methods.owner.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.getWhitelistedAddresses.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.currentPeriodStartTime.cacheCall();
      this.drizzle.contracts.KyodoDAO.methods.periodDaysLength.cacheCall();
    }

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
          <FundStatistics />
          <UserBalance
            contractName="DecentToken"
            account={this.props.accounts[0]}
          />
          <br />
          <br />
          {whitelistedAddresses.length > 0 || owner === userAddress
            ? <Members
                canAdd={owner === userAddress}
                address={address}
                whitelistedAddresses={whitelistedAddresses}
              />
            : null}
          {owner === userAddress ? <MintTokens /> : null}
          {whitelistedAddresses.indexOf(userAddress) >= 0
            ? <Nickname
                address={userAddress}
                nickname={this.state.nickname}
                onSaveNickname={this.handleSaveNickName}
              />
            : null}
        </StyledMainInfoContainer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  KyodoDAO: state.contracts.KyodoDAO,
  DecentToken: state.contracts.DecentToken,
  drizzleStatus: state.drizzleStatus,
  owner: getOwner(getContract('KyodoDAO')(state)),
  whitelistedAddresses: getWhitelistedAddresses(
    getContract('KyodoDAO')(state),
  ).map(address => ({ value: address })),
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
