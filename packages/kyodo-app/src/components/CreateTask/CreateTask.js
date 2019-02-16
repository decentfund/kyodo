import React, { useReducer } from 'react';
import { connect } from 'react-redux';
import { DrizzleContext } from 'drizzle-react';
import DomainSelector from './DomainSelector';
import { Header } from '../Page';
import { FormInput, FormTextArea } from '../Form';
import Button from '../Button';
import NumberInput from '../NumberInput';
import { createTask } from '../../actions';

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

const cleanState = state => {
  return Object.keys(state).reduce(
    (memo, value) => ({
      ...memo,
      [value]: state[value].value,
    }),
    {},
  );
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
          onClick={() => handleClick(cleanState(state))}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

function DrizzleCreateTask({ createTask, task, ...props }) {
  // TODO: Try to use drizzle-react hooks
  let transactionStatus;

  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzleState } = drizzleContext;

        if (
          task.transactionKey &&
          drizzleState.transactionStack[task.transactionKey]
        ) {
          const txHash = drizzleState.transactionStack[task.transactionKey];
          transactionStatus = drizzleState.transactions[txHash].status;
          // TODO: If status changed fetch tasks another time
        }

        return (
          <CreateTask
            handleClick={createTask}
            transactionStatus={transactionStatus}
            {...props}
          />
        );
      }}
    </DrizzleContext.Consumer>
  );
}

const mapStateToProps = state => ({
  task: state.task,
  domains: state.colony.domains,
});

export default connect(
  mapStateToProps,
  { createTask },
)(DrizzleCreateTask);
