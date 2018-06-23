import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Nickname extends Component {
  state = {};

  changeNickname = e => {
    this.setState({ nickname: e.target.value });
  };

  componentDidMount() {
    this.setState({ nickname: this.props.nickname });
  }

  componentWillReceiveProps({ nickname }) {
    console.log('nickname');
    this.setState({ nickname });
  }

  render() {
    const { nickname } = this.state;
    const { loading, address } = this.props;
    return (
      <div>
        <div>{address}</div>
        <input
          value={nickname}
          disabled={loading}
          onChange={this.changeNickname}
        />
        <button onClick={() => this.props.onSaveNickname(this.state.nickname)}>
          Save
        </button>
      </div>
    );
  }
}

Nickname.propTypes = {
  address: PropTypes.string,
  loading: PropTypes.bool,
  web3: PropTypes.object,
  onSaveNickname: PropTypes.func,
};

export default Nickname;
