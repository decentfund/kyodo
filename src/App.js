import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Helloworld from './Helloworld.js';
import DecentToken from '../build/contracts/DecentToken.json';
import getWeb3 from './utils/getWeb3';

class App extends Component {
  componentWillMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3,
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log('Error finding web3.');
      });
  }
  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const decentToken = contract(DecentToken);
    console.log(decentToken);
    decentToken.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    // var simpleStorageInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const tokenContract = await decentToken.deployed();
      const totalSupply = await tokenContract.totalSupply();
      const currentUserBalance = await tokenContract.balanceOf(0x0);
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();

      this.setState({
        totalSupply: totalSupply.toNumber(),
        currentUserBalance: currentUserBalance.toNumber(),
        tokenName,
        tokenSymbol,
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
    const { totalSupply, currentUserBalance, tokenName, tokenSymbol } =
      this.state || {};
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Helloworld />
        <div>
          {currentUserBalance} {tokenSymbol}
        </div>
        <div>Total supply of {tokenName}:</div>
        <div>
          {totalSupply} {tokenSymbol}
        </div>
      </div>
    );
  }
}

export default App;
