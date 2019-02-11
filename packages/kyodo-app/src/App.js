import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import difference from 'lodash/difference';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import KyodoDAO from '@kyodo/contracts/build/contracts/KyodoDAO_V1.json';
import AddRiotID from './components/AddRiotID';
import Members from './components/Members';
import MultisigBalance from './components/MultisigBalance';
import MintTokens from './components/MintTokens';
import UserBalance from './components/UserBalance';
import FundStatistics from './components/FundStatistics';
import CurrentPeriodStatus from './components/CurrentPeriodStatus';
import TotalSupplyChange from './components/TotalSupplyChange';
import Earnings from './components/Earnings';
import TasksList from './components/TasksList';
import PeriodPointsDistribution from './components/PeriodPointsDistribution';
import PeriodDistributionSummary from './components/PeriodDistributionSummary';
import LeaderBoard from './components/LeaderBoard';
import {
  getContract,
  getOwner,
  getWhitelistedAddresses,
  getSymbol,
} from './reducers';
import {
  getColony,
  getColonyNetworkClient,
  loadMultiSigBalance,
  loadPeriodTasks,
  loadRate,
} from './actions';
import {
  generateContractConfigFromEvent,
  generateContractConfigFromName,
} from './helpers/contracts';

createGlobalStyle`
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
  max-width: 772px;
`;

class App extends Component {
  state = {
    whitelistedAddresses: [],
    domainsAddress: process.env.REACT_DOMAINS_ADDRESS,
    kyodoAddress: process.env.REACT_KYODO_ADDRESS,
    membersAddress: process.env.REACT_MEMBERS_ADDRESS,
    periodsAddress: process.env.REACT_PERIODS_ADDRESS,
  };

  constructor(props, context) {
    super(props);

    this.drizzle = props.drizzle;

    if (process.env.REACT_APP_KYODODAO_CONTRACT_ADDRESS) {
      const contractConfig = {
        contractName: 'KyodoDAO',
        web3Contract: new this.drizzle.web3.eth.Contract(
          KyodoDAO.abi,
          process.env.REACT_APP_KYODODAO_CONTRACT_ADDRESS,
        ),
      };
      this.drizzle.addContract(contractConfig, [
        {
          eventName: 'DomainsAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
        {
          eventName: 'PeriodsAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
        {
          eventName: 'MembersAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
      ]);
    }

    const modules = [
      {
        name: 'Members',
        address: process.env.REACT_APP_MEMBERS_CONTRACT_ADDRESS,
      },
      {
        name: 'Domains',
        address: process.env.REACT_APP_DOMAINS_CONTRACT_ADDRESS,
      },
      {
        name: 'Periods',
        address: process.env.REACT_APP_PERIODS_CONTRACT_ADDRESS,
      },
    ];

    modules.forEach(({ name, address }) => {
      if (address) {
        const contractConfig = generateContractConfigFromName({
          name,
          web3: this.drizzle.web3,
          address,
        });

        if (contractConfig && !this.drizzle.contracts[name]) {
          const call = this.drizzle.addContract(contractConfig);
        }
      }
    });
  }

  componentDidUpdate(lastProps) {
    if (
      this.props.Registry.events !== lastProps.Registry.events &&
      this.props.Registry.events.length > 0
    ) {
      const proxyAddress = this.props.Registry.events[0].returnValues[1];
      if (proxyAddress !== this.state.kyodoAddress)
        console.log('error in kyodo address, take care!');
      const contractConfig = {
        contractName: 'KyodoDAO',
        web3Contract: new this.drizzle.web3.eth.Contract(
          KyodoDAO.abi,
          proxyAddress,
        ),
      };

      this.drizzle.addContract(contractConfig, [
        {
          eventName: 'DomainsAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
        {
          eventName: 'PeriodsAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
        {
          eventName: 'MembersAddressChanged',
          eventOptions: {
            fromBlock: 0,
          },
        },
      ]);
    }
    if (
      this.props.KyodoDAO &&
      this.props.KyodoDAO.events &&
      this.props.KyodoDAO.events.length > 0
    ) {
      const newEvents = difference(
        this.props.KyodoDAO.events,
        lastProps.KyodoDAO.events,
      );
      newEvents.forEach(({ event, returnValues }) => {
        const proxyAddress = returnValues._address;

        const contractConfig = generateContractConfigFromEvent({
          event,
          web3: this.drizzle.web3,
          address: proxyAddress,
        });

        if (contractConfig) this.drizzle.addContract(contractConfig);
      });
    }

    if (this.drizzle.contracts.KyodoDAO && !this.state.colonyAddressKey) {
      this.drizzle.contracts.KyodoDAO.methods.owner.cacheCall();

      const colonyAddressKey = this.drizzle.contracts.KyodoDAO.methods.colony.cacheCall();
      this.setState({
        colonyAddressKey,
      });
    }

    if (
      !this.props.colonyNetworkClient &&
      !this.props.colonyNetworkClientLoading &&
      window.web3 &&
      window.web3.currentProvider
    ) {
      this.props.getColonyNetworkClient(window.web3.currentProvider);
    }

    if (
      this.state.colonyAddressKey &&
      this.props.KyodoDAO.colony[this.state.colonyAddressKey] &&
      this.props.colonyNetworkClient &&
      !this.props.colonyClient &&
      !this.props.colonyClientLoading
    ) {
      this.props.getColony(
        this.props.KyodoDAO.colony[this.state.colonyAddressKey].value,
      );
    }

    if (this.drizzle.contracts.Periods && !this.state.prevBlockKey) {
      const prevBlockKey = this.drizzle.contracts.Periods.methods.currentPeriodStartBlock.cacheCall();
      this.setState({
        prevBlockKey,
      });
    }

    if (this.drizzle.contracts.Members) {
      this.drizzle.contracts.Members.methods.getWhitelistedAddresses.cacheCall();
    }

    if (this.drizzle.contracts.Token) {
      this.drizzle.contracts.Token.methods.totalSupply.cacheCall();
      this.drizzle.contracts.Token.methods.decimals.cacheCall();
      this.drizzle.contracts.Token.methods.symbol.cacheCall();
    }
  }

  componentDidMount() {
    // // FIXME: move load rate to loadMultisigBalance saga
    this.props.loadRate(['ETH', ...Object.keys(process.env.BALANCE)]);
    this.props.loadMultiSigBalance();
    this.props.loadPeriodTasks();
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
    // .then(() => Token.balanceOf.call(account))
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
      tokenSymbol,
    } = this.props;
    let prevBlock, colonyAddress;

    if (
      this.state.prevBlockKey &&
      this.props.Periods &&
      this.props.Periods.currentPeriodStartBlock[this.state.prevBlockKey]
    ) {
      prevBlock =
        parseInt(
          this.props.Periods.currentPeriodStartBlock[this.state.prevBlockKey]
            .value,
        ) - 1;
    }

    if (
      this.state.colonyAddressKey &&
      this.props.KyodoDAO.colony[this.state.colonyAddressKey]
    ) {
      colonyAddress = this.props.KyodoDAO.colony[this.state.colonyAddressKey]
        .value;
    }

    if (
      !this.drizzle.contracts.Periods ||
      !this.drizzle.contracts.Members ||
      !this.drizzle.contracts.Domains
    )
      return <div />;

    return (
      <Router>
        <div className="App">
          <Header userAddress={userAddress} />
          <StyledMainInfoContainer>
            <Route
              exact
              path="/"
              render={props => (
                <div style={{ marginBottom: 50 }}>
                  <FundStatistics />
                  <UserBalance contractName="Token" account={userAddress} />
                  {prevBlock ? (
                    <TotalSupplyChange prevBlock={prevBlock} />
                  ) : null}
                </div>
              )}
            />
            <Route
              path="/stats/tips"
              render={props => (
                <div style={{ marginBottom: 50 }}>
                  {colonyAddress ? (
                    <CurrentPeriodStatus
                      tokenSymbol={tokenSymbol}
                      prevBlock={prevBlock}
                      colonyAddress={colonyAddress}
                    />
                  ) : null}
                  <Earnings />
                  <TasksList />
                </div>
              )}
            />
            <Route
              path="/stats/distribution"
              render={props => (
                <div style={{ marginBottom: 50 }}>
                  <PeriodDistributionSummary />
                </div>
              )}
            />
            <Route
              path="/stats/leaderboard"
              render={props => (
                <div style={{ marginBottom: 50 }}>
                  <LeaderBoard members={whitelistedAddresses} />
                </div>
              )}
            />
            <Route
              path="/points"
              render={props => <PeriodPointsDistribution />}
            />
            <Route
              path="/user"
              render={props => <AddRiotID account={userAddress} />}
            />
            <Route
              exact
              path="/members"
              render={props =>
                whitelistedAddresses.length > 0 || owner === userAddress ? (
                  <Members
                    canAdd={owner === userAddress}
                    address={address}
                    whitelistedAddresses={whitelistedAddresses}
                  />
                ) : null
              }
            />
            {owner === userAddress ? <MintTokens /> : null}
            <Route exact path="/" render={props => <MultisigBalance />} />
          </StyledMainInfoContainer>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
  KyodoDAO: getContract('KyodoDAO')(state),
  Registry: getContract('Registry')(state),
  Token: getContract('Token')(state),
  Periods: getContract('Periods')(state),
  Members: getContract('Members')(state),
  drizzleStatus: state.drizzleStatus,
  owner: getOwner(getContract('KyodoDAO')(state)),
  tokenSymbol: getSymbol(getContract('Token')(state)),
  whitelistedAddresses: getWhitelistedAddresses(getContract('Members')(state)),
  colonyNetworkClient: state.colony.networkClient,
  colonyClient: state.colony.client,
  colonyClientLoading: state.colony.clientLoading,
  colonyNetworkClientLoading: state.colony.networkClientLoading,
});

App.contextTypes = {
  drizzle: PropTypes.object,
};

export default hot(
  connect(
    mapStateToProps,
    {
      getColony,
      getColonyNetworkClient,
      loadMultiSigBalance,
      loadPeriodTasks,
      loadRate,
    },
  )(App),
);
