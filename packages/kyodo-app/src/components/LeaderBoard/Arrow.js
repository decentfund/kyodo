import React from 'react';
import arrow from './arrow.svg';
import activeArrow from './active_arrow.svg';

const Arrow = ({ active, onClick = () => {} }) => (
  <img src={active ? activeArrow : arrow} alt="sorting" onClick={onClick} />
);

export default Arrow;
