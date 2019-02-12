import React, { useReducer, useState } from 'react';
import { connect } from 'react-redux';
import { DrizzleContext } from 'drizzle-react';
import DomainSelector from './DomainSelector';
import { Header } from '../Page';
import { FormInput, FormTextArea } from '../Form';
import Button from '../Button';
import NumberInput from '../NumberInput';

function reducer(state, action) {
  switch (action.type) {
    case 'handleChange':
      return {
        ...state,
        [action.id]: {
          value: action.value,
          changed: true,
        },
      };
    default:
      return state;
  }
}

const initialState = {
  title: {
    changed: false,
  },
  description: {
    changed: false,
  },
  domain: {
    changed: false,
  },
  amount: {
    changed: false,
  },
};

const CreateTask = ({
  handleClick,
  domains,
  task = initialState,
  transactionStatus,
}) => {
  const [state, dispatch] = useReducer(reducer, task);
  const { amount, title, description, domain } = state;

  const handleChange = event => {
    const { id, value } = event.target;

    dispatch({ type: 'handleChange', id, value });
  };
  return (
    <div>
      <Header>Submit a task</Header>
      <FormInput
        id="title"
        onChange={handleChange}
        type="text"
        label="task title:"
        value={title.value}
        width="66%"
        focusable
      />
      <FormTextArea
        id="description"
        onChange={handleChange}
        type="text"
        label="description:"
        value={description.value}
        width="100%"
        focusable
        height="238px"
      />
      <DomainSelector
        id="domain"
        onChange={handleChange}
        domainId={domain.value}
        domains={domains}
      />
      <NumberInput
        onChange={handleChange}
        id="amount"
        value={amount.value}
        label="amount:"
      />
      <div style={{ marginTop: '34px' }}>
        <Button
          active={title.value && domain.value}
          onClick={() => handleClick(state)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

function DrizzleCreateTask(props) {
  // TODO: Try to use drizzle-react hooks
  const [taskKey, setTask] = useState();
  let transactionStatus;

  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzle, drizzleState } = drizzleContext;
        const handleClick = state => {
          // TODO: Upload ipfs description and get hash
          const ipfsHash =
            '0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231';
          console.log(state);
          console.log(drizzleState);
          console.log(drizzle.contracts.KyodoDAO);
          console.log(drizzleState.accounts[0]);
          const key = drizzle.contracts.KyodoDAO.methods.createTask.cacheSend(
            state.domain.value,
            ipfsHash,
            state.amount.value,
            { from: drizzleState.accounts[0] },
          );
          setTask(key);
        };

        if (drizzleState.transactionStack[taskKey]) {
          const txHash = drizzleState.transactionStack[taskKey];
          transactionStatus = drizzleState.transactions[txHash].status;
        }

        // TODO: If successfully saved store task on the backend or ipfs is enough?? or try to fetch data from parsed event on the backend

        // TODO: And possibility assign user

        return (
          <CreateTask
            handleClick={handleClick}
            transactionStatus={transactionStatus}
            {...props}
          />
        );
      }}
    </DrizzleContext.Consumer>
  );
}

// TODO: Those would be absolute after state handling in DrizzleCreateTask
const mapStateToProps = state => {
  console.log(state);
  return {
    task: state.task,
    domains: state.colony.domains,
  };
};

export default connect(mapStateToProps)(DrizzleCreateTask);
