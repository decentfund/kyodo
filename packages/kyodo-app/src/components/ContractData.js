import React, { Component } from 'react';
import drizzleConnect from '../utils/drizzleConnect';

/*
 * Create component.
 */

class ContractData extends Component {
  constructor(props) {
    super(props);

    this.contracts = props.drizzle.contracts;

    // Fetch initial value from chain and return cache key for reactive updates.
    var methodArgs = this.props.methodArgs ? this.props.methodArgs : [];
    this.dataKey = this.contracts[this.props.contract].methods[
      this.props.method
    ].cacheCall(...methodArgs);
  }

  render() {
    const { drizzle, drizzleState } = this.props;

    // Contract is not yet intialized.
    if (!drizzleState.contracts[this.props.contract].initialized) {
      return <span>Initializing...</span>;
    }

    // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
    if (
      !(
        this.dataKey in
        drizzleState.contracts[this.props.contract][this.props.method]
      )
    ) {
      return null;
    }

    // Show a loading spinner for future updates.
    var pendingSpinner = drizzleState.contracts[this.props.contract].synced
      ? ''
      : ' 🔄';
    // Optionally hide loading spinner (EX: ERC20 token symbol).
    if (this.props.hideIndicator) {
      pendingSpinner = '';
    }
    var displayData =
      drizzleState.contracts[this.props.contract][this.props.method][
        this.dataKey
      ].value;
    if (displayData instanceof Object) {
      displayData = Object.values(displayData);
    }
    if (this.props.displayFunc) {
      return this.props.displayFunc(displayData);
    }
    // Optionally convert to UTF8
    if (this.props.toUtf8) {
      displayData = drizzle.web3.utils.hexToUtf8(displayData);
    }
    // Optionally convert to Ascii
    if (this.props.toAscii) {
      displayData = drizzle.web3.utils.hexToAscii(displayData);
    }
    if (displayData instanceof Array) {
      const displayListItems = displayData.map((datum, i) => (
        <li key={i}>
          {datum}
          {pendingSpinner}
        </li>
      ));
      return <ul>{displayListItems}</ul>;
    }
    return (
      <span>
        {displayData}
        {pendingSpinner}
      </span>
    );
  }
}
export default drizzleConnect(ContractData);
