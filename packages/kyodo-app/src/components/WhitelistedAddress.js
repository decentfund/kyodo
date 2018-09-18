import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import FormattedAddress from './FormattedAddress';
import { getContract, getTotalSupply } from '../reducers';
import { formatDecimals } from '../helpers/format';

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
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

class WhitelistedAddress extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }
  componentDidMount() {
    const { KyodoDAO, DecentToken } = this.contracts;

    const aliasKey = KyodoDAO.methods.getAlias.cacheCall(this.props.value);
    const balanceKey = DecentToken.methods.balanceOf.cacheCall(
      this.props.value,
    );
    const decimalsKey = DecentToken.methods.decimals.cacheCall();

    this.setState({ aliasKey, balanceKey, decimalsKey });
  }
  render() {
    // TODO: Loading
    if (
      !this.state.balanceKey ||
      !this.props.DecentToken.balanceOf[this.state.balanceKey] ||
      !this.state.decimalsKey ||
      !this.props.DecentToken.decimals[this.state.decimalsKey]
    )
      return null;

    let alias =
      this.state &&
      this.state.aliasKey &&
      this.props.KyodoDAO.getAlias[this.state.aliasKey];
    const { value, totalSupply } = this.props;

    const balance = formatDecimals(
      this.props.DecentToken.balanceOf[this.state.balanceKey].value,
      this.props.DecentToken.decimals[this.state.decimalsKey].value,
    );

    return (
      <StyledContainer>
        <StyledAlias isPlaceholder={!(alias && alias.value)}>
          {(alias && alias.value) || 'member known as'}
        </StyledAlias>
        <FormattedAddress>{value}</FormattedAddress>
        <span>{balance}</span>
        <span>{((balance / totalSupply) * 100).toFixed(2)}%</span>
      </StyledContainer>
    );
  }
}

WhitelistedAddress.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  drizzleStatus: state.drizzleStatus,
  totalSupply: getTotalSupply(getContract('DecentToken')(state)),
  DecentToken: getContract('DecentToken')(state),
  KyodoDAO: getContract('KyodoDAO')(state),
});

export default drizzleConnect(WhitelistedAddress, mapStateToProps);
