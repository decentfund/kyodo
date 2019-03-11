import React from 'react';

const NumberInput = ({ id, label, ...props }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input type="number" id={id} {...props} />
  </div>
);

export default NumberInput;
