import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getCurrentUserAddress } from '../../reducers';
import {
  acceptTask,
  assignWorker,
  claimPayout,
  submitTaskWorkRating,
} from '../../actions';

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

const formatAssigneeAddress = assignee => {
  const status = [];
  if (assignee.address) {
    status.push(assignee.accepted ? '✅' : '⏰');
  }
  if (assignee.loaded && assignee.address) {
    status.push(assignee.address);
  } else if (assignee.loading) {
    status.push('loading...');
  } else {
    status.push('-');
  }
  return status.join(' ');
};

function Task({
  id,
  title,
  description,
  domain,
  amount,
  assignee,
  manager,
  userAddress,
  acceptTask,
  assignWorker,
  ratingsCount,
  submitTaskWorkRating,
  claimPayout,
  status,
}) {
  const [isAssigning, toggleAssign] = useState(false);
  const [stateAssignee, handleChange] = useState(undefined);
  return (
    <div>
      <StyledTask key={id}>
        <StyledTaskTitle>
          {status === 'FINALIZED' ? '✅' : ''}
          {title}
          <br />
          {description}
        </StyledTaskTitle>
        <StyledAssignee>
          {formatAssigneeAddress(assignee)}{' '}
          {assignee.loaded && userAddress === manager.address.toLowerCase() ? (
            <button onClick={() => toggleAssign(!isAssigning)}>Change</button>
          ) : null}
          {assignee.loaded &&
          userAddress === assignee.address &&
          !assignee.accepted ? (
            <button onClick={() => acceptTask(id)}>Accept</button>
          ) : null}
        </StyledAssignee>
        <StyledDomainCode>{domain}</StyledDomainCode>
        <StyledTips>{amount}</StyledTips>
      </StyledTask>
      {isAssigning ? (
        <div>
          <input
            type="text"
            value={stateAssignee || assignee}
            onChange={e => handleChange(e.target.value)}
          />
          <button
            onClick={() => assignWorker({ address: stateAssignee, taskId: id })}
          >
            Submit
          </button>
        </div>
      ) : null}
      {ratingsCount > 0 &&
      ratingsCount < 2 &&
      userAddress === manager.address.toLowerCase() ? (
        <button
          onClick={() =>
            submitTaskWorkRating({ taskId: id, rating: 3, role: 'WORKER' })
          }
        >
          Set top rating
        </button>
      ) : null}
      {userAddress === assignee.address.toLowerCase() &&
      assignee.rating > 0 &&
      status === 'ACTIVE' ? (
        <button onClick={() => claimPayout({ taskId: id })}>
          Claim payout
        </button>
      ) : null}
    </div>
  );
}

const mapStateToProps = state => ({
  userAddress: getCurrentUserAddress(state),
});

export default connect(
  mapStateToProps,
  { acceptTask, assignWorker, submitTaskWorkRating, claimPayout },
)(React.memo(Task));
