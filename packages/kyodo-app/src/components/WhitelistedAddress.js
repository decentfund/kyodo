import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import FormattedAddress from './FormattedAddress';
import { getContract } from '../reducers';

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledDiv = styled.div`
  font-family: Roboto Mono;
  font-size: 18px;
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
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }
  componentDidMount() {
    const contract = this.contracts.KyodoDAO;

    // let drizzle know we want to watch the `myString` method
    const dataKey = contract.methods.getAlias.cacheCall(this.props.value);

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey });
  }
  render() {
    let alias =
      this.state &&
      this.state.dataKey &&
      this.props.KyodoDAO.getAlias[this.state.dataKey];
    const { value } = this.props;

    return (
      <StyledContainer>
        <StyledAlias isPlaceholder={!(alias && alias.value)}>
          {(alias && alias.value) || 'member known as'}
        </StyledAlias>
        <FormattedAddress>{value}</FormattedAddress>
      </StyledContainer>
    );
  }
}

WhitelistedAddress.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  drizzleStatus: state.drizzleStatus,
  KyodoDAO: getContract('KyodoDAO')(state),
});

export default drizzleConnect(WhitelistedAddress, mapStateToProps);
