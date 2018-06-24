import React, { Component } from 'react';
import { injectGlobal } from 'styled-components';
import Helloworld from './Helloworld.js';
import Nickname from './Nickname';
import Header from './components/Header';
import Members from './components/Members';
import DecentToken from '../build/contracts/DecentToken.json';
import KyodoDAO from '../build/contracts/KyodoDAO.json';
import { drizzleConnect } from 'drizzle-react';

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
`;

class App extends Component {
  state = {
    whitelistedAddresses: [],
  };

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
      web3: {
        eth: {
          accounts: [account],
        },
      },
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
    const {
      address,
      currentUserBalance,
      owner,
      tokenName,
      tokenSymbol,
      totalSupply,
      whitelistedAddresses,
    } = this.state;
    const {
      accounts: { 0: userAddress },
    } = this.props;
    return (
      <div className="App">
        <Header userAddress={userAddress} />
        <Helloworld />
        <div>
          {currentUserBalance} {tokenSymbol}
        </div>
        <div>Total supply of {tokenName}:</div>
        <div>
          {totalSupply} {tokenSymbol}
        </div>
        <Members
          canAdd={owner === userAddress}
          address={address}
          whitelistedAddresses={whitelistedAddresses}
        />
        {whitelistedAddresses.indexOf(userAddress) >= 0 ? (
          <Nickname
            address={userAddress}
            nickname={this.state.nickname}
            onSaveNickname={this.handleSaveNickName}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accounts: state.accounts,
});

export default drizzleConnect(App, mapStateToProps);
