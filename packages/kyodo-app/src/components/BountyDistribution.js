import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Header } from './Page';
import ContractData from './ContractData';
import { formatDecimals } from '../helpers/format';
import { getContract, getDecimals, getPots } from '../reducers';

class BountyDistribution extends PureComponent {
  render() {
    const { domains = [], pots, contractName, decimals } = this.props;
    return (
      <div>
        <Header>Bounty distribution</Header>
        {domains.map(domain => (
          <div>
            {domain.name}:{' '}
            {domain.potId &&
              pots[domain.potId] &&
              formatDecimals(pots[domain.potId].balance, decimals)}{' '}
            <ContractData contract={contractName} method="symbol" />
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state, { contractName }) => ({
  domains: state.colony.domains,
  pots: getPots(state),
  decimals: getDecimals(getContract(contractName)(state)),
});

export default connect(mapStateToProps)(BountyDistribution);
