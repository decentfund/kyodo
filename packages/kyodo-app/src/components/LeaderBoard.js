import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import orderBy from 'lodash/orderBy';
import Leader from './Leader';
import { getLeaderboardData } from '../reducers';

class LeaderBoard extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  render() {
    const { users } = this.props;
    const totalLeaderPoints = orderBy(users, ['tips.total'], ['desc'])[0].tips
      .total;
    return (
      <div>
        {orderBy(users, ['tips.total'], ['desc']).map(
          ({ user, userAddress, tips: { total } }, index) => (
            <Leader
              leader={index === 0}
              name={user}
              address={userAddress}
              width={total / totalLeaderPoints}
            />
          ),
        )}
      </div>
    );
  }
}

LeaderBoard.contextTypes = {
  drizzle: PropTypes.object,
  members: PropTypes.array,
};

const mapStateToProps = state => {
  const data = getLeaderboardData(state);
  return {
    users: data.userStats,
    domains: data.domains,
    domainStats: data.domainStats,
  };
};

export default drizzleConnect(LeaderBoard, mapStateToProps);
