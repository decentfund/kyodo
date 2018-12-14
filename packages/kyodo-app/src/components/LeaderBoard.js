import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import Leader from './Leader';

class LeaderBoard extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  render() {
    // FIXME: Temporary elements
    return (
      <div>
        <Leader name="igor" width={100} />
        <Leader name="wijuwiju" width={49} />
        <Leader name="parygina" width={1} />
      </div>
    );
  }
}

LeaderBoard.contextTypes = {
  drizzle: PropTypes.object,
  members: PropTypes.array,
};

const mapStateToProps = (state, { account }) => ({});

export default drizzleConnect(LeaderBoard, mapStateToProps);
