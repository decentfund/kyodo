import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import FormattedAddress from './FormattedAddress';

import { getContract } from '../reducers';
import { formatDecimals, formatCurrency } from '../helpers/format';
import drizzleConnect from '../utils/drizzleConnect';

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
  font-size: 16px;
`;

const StyledDiv = styled.div`
  font-family: Roboto Mono;
  font-size: 16px;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  margin-bottom: 27px;
`;

const GRAY = 'rgba(0, 0, 0, 0.2)';
const BLACK = 'rgb(0, 0, 0)';

const StyledAlias = StyledDiv.extend`
  width: 170px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  color: ${props => (props.isPlaceholder ? GRAY : BLACK)};
`;

const StyledValue = styled.div`
  width: 60px;
  text-align: center;
  margin: 0 0 0 20px;
`;

const StyledShare = StyledValue.extend`
  text-align: right;
`;

class WhitelistedAddress extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }
  componentDidMount() {
    const { Members, Token } = this.contracts;

    const aliasKey = Members.methods.getAlias.cacheCall(this.props.value);
    const balanceKey = Token.methods.balanceOf.cacheCall(this.props.value);
    const decimalsKey = Token.methods.decimals.cacheCall();
    const totalSupplyKey = Token.methods.totalSupply.cacheCall();

    this.setState({ aliasKey, balanceKey, decimalsKey, totalSupplyKey });
  }
  render() {
    // TODO: Loading
    if (
      !this.state.balanceKey ||
      !this.props.Token.balanceOf[this.state.balanceKey] ||
      !this.state.decimalsKey ||
      !this.props.Token.decimals[this.state.decimalsKey] ||
      !this.state.totalSupplyKey ||
      !this.props.Token.totalSupply[this.state.totalSupplyKey]
    )
      return null;

    let alias =
      this.state &&
      this.state.aliasKey &&
      this.props.Members.getAlias[this.state.aliasKey];

    let totalSupply =
      this.state &&
      this.state.totalSupplyKey &&
      this.props.Token.totalSupply[this.state.totalSupplyKey].value;

    totalSupply = formatDecimals(
      this.props.Token.totalSupply[this.state.totalSupplyKey].value,
      this.props.Token.decimals[this.state.decimalsKey].value,
    );

    const { value } = this.props;

    const balance = formatDecimals(
      this.props.Token.balanceOf[this.state.balanceKey].value,
      this.props.Token.decimals[this.state.decimalsKey].value,
    );

    return (
      <StyledContainer>
        <StyledAlias isPlaceholder={!(alias && alias.value)}>
          {(alias && alias.value) || 'member known as'}
        </StyledAlias>
        <FormattedAddress>{value}</FormattedAddress>
        <StyledValue>{formatCurrency(balance, 'DF', 2)}</StyledValue>
        <StyledShare>{((balance / totalSupply) * 100).toFixed(2)}%</StyledShare>
      </StyledContainer>
    );
  }
}

WhitelistedAddress.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  drizzleStatus: state.drizzleStatus,
  Token: getContract('Token')(state),
  Members: getContract('Members')(state),
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(WhitelistedAddress);
