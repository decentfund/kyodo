import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getContract, getOwner } from '../../reducers';

const StyledTaskTitle = styled.div`
  margin-right: 20px;
  flex-grow: 1;
  width: 157px;
`;

const StyledAssignee = styled.div`
  margin-right: 20px;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDomainCode = styled.div`
  margin-right: 20px;
  width: 75px;
`;

const StyledTips = styled.div`
  width: 40px;
  text-align: right;
`;

const StyledTask = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 16px;
  margin-bottom: 15px;
`;

function Task({
  id,
  title,
  description,
  domain,
  amount,
  // TODO: Temporary compare if manager is either kyodo either current user
  // manager,
  userAddress,
  owner,
}) {
  const [isAssigning, toggleAssign] = useState(false);
  if (owner !== userAddress) return null;
  return (
    <div>
      <StyledTask key={id}>
        <StyledTaskTitle>
          {title}
          <br />
          {description}
        </StyledTaskTitle>
        <StyledAssignee>
          - <button onClick={() => toggleAssign(!isAssigning)}>Change</button>
        </StyledAssignee>
        <StyledDomainCode>{domain}</StyledDomainCode>
        <StyledTips>{amount}</StyledTips>
      </StyledTask>
      {isAssigning ? <input type="text" /> : null}{' '}
    </div>
  );
}

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
  owner: getOwner(getContract('KyodoDAO')(state)),
});

export default connect(mapStateToProps)(React.memo(Task));
