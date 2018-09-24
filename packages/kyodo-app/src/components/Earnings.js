import React, { Component } from 'react';
import styled from 'styled-components';
import pointsIcon from './points_icon.svg';

const StyledContainer = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 9px;
  font-size: 16px;
  margin-bottom: 40px;
`;

const StyledPointsIcon = styled.img`
  vertical-align: middle;
`;

class Earnings extends Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    points: 0,
  };

  render() {
    return (
      <StyledContainer>
        you earned <StyledPointsIcon src={pointsIcon} /> {this.state.points}{' '}
        points
      </StyledContainer>
    );
  }
}

export default Earnings;
