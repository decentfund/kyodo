import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 20px;
  height: 5px;
  background: #f5f905;
  overflow: hidden;
`;

const StyledProgress = styled.div`
  width: ${props => props.fraction * 100}%;
  border-right: 1px solid #000000;
  background: white;
  height: 5px;
`;

const ProgressBar = ({ fraction }) => (
  <StyledWrapper>
    <StyledProgress fraction={fraction} />
  </StyledWrapper>
);

ProgressBar.defaultProps = {
  fraction: 0,
};

ProgressBar.propTypes = {
  fraction: PropTypes.number,
};

export default ProgressBar;
