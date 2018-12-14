import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Blockies from 'react-blockies';

const Container = styled.div`
  height: 24px;
  width: 100%;
  display: flex;
`;

const Name = styled.div`
  background: rgba(0, 0, 0, 0.06);
  border-radius: 0px 12px 12px 0px;
  line-height: 24px;
  flex-grow: ${({ width }) => (1 * (width || 100)) / 100};
  padding: 0 0 0 6px;
`;

class Leader extends Component {
  render() {
    const { width, name } = this.props;
    return (
      <Container>
        <Blockies
          seed={name}
          size={8}
          scale={3}
          color="#BD6FD8"
          spotColor="#EEEEEE"
          bgColor="#F5F905"
        />
        <Name width={width}>{name}</Name>
      </Container>
    );
  }
}

Leader.contextTypes = {
  name: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  width: PropTypes.number,
};

export default Leader;
