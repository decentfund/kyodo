import React from 'react';

const DomainSelector = ({ onChange, domainId, domains, id }) => (
  <div>
    <label htmlFor={id}>domain</label>
    <select id={id} onChange={onChange} value={domainId}>
      <option value={0}>{'select domain...'}</option>
      {domains ? (
        domains.map(domain => (
          <option key={domain.potId} value={domain.potId}>
            {domain.name}
          </option>
        ))
      ) : (
        <option value={null}>{'loading...'}</option>
      )}
    </select>
  </div>
);

export default DomainSelector;
