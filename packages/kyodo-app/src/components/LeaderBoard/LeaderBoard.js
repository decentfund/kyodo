import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import orderBy from 'lodash/orderBy';

import Leader from './Leader';
import Header from './Header';

import { getLeaderboardData, getPointPrice, getRate } from '../../reducers';
import drizzleConnect from '../../utils/drizzleConnect';

class LeaderBoard extends Component {
  state = {
    sorting: 'total',
  };

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  handleSortingChange = sorting => {
    this.setState({ sorting });
  };

  render() {
    const {
      users,
      domains,
      pointPrice,
      tokenPriceEUR,
      tokenPriceETH,
      domainStats,
    } = this.props;
    const { sorting } = this.state;
    const totalLeader = orderBy(users, ['tips.total'], ['desc'])[0];
    const totalLeaderPoints = totalLeader.tips.total;
    const order = `tips.${sorting}`;
    return (
      <div>
        <Header
          domains={domains}
          onSortingChange={this.handleSortingChange}
          sorting={sorting}
        />
        {orderBy(users, [order], ['desc']).map(
          ({ user, userAddress, tips }, index) => (
            <Leader
              leader={user === totalLeader.user}
              name={user}
              address={userAddress}
              width={tips.total / totalLeaderPoints}
              earnings={tips}
              domains={domains}
              pointPrice={pointPrice}
              tokenPriceEUR={tokenPriceEUR}
              tokenPriceETH={tokenPriceETH}
              domainStats={domainStats}
              sorting={sorting}
            />
          ),
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const data = getLeaderboardData(state);
  return {
    users: data.userStats,
    domains: state.colony.domains,
    domainStats: data.domainStats,
    pointPrice: getPointPrice(state),
    tokenPriceEUR: getRate(state, 'DF', 'EUR'),
    tokenPriceETH: getRate(state, 'DF', 'ETH'),
  };
};

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(LeaderBoard);
