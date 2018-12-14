import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Blockies from 'react-blockies';

const Container = styled.div`
  height: 24px;
  width: 100%;
  display: flex;
  margin-bottom: 24px;
`;

const Name = styled.div`
  line-height: 24px;
  padding: 0 0 0 6px;
  position: relative;
  flex-grow: 1;

  &:before {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 0px 12px 12px 0px;
    content: '';
    position: absolute;
    left: 0px;
    width: ${({ width }) => `${width * 100}%`};
    height: 100%;
  }
`;

class Leader extends Component {
  render() {
    const { width, name, address } = this.props;
    return (
      <Container>
        <Blockies
          seed={address}
          size={8}
          scale={3}
          color="#BD6FD8"
          spotColor="#EEEEEE"
          bgColor="#F5F905"
        />
        <Name width={width}>
          {name || `member known as ${address.substring(4, -4)}`}
        </Name>
      </Container>
    );
  }
}

Leader.contextTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  width: PropTypes.number,
};

export default Leader;
