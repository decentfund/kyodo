import React, { useReducer } from 'react';
import { connect } from 'react-redux';
import { DrizzleContext } from 'drizzle-react';
import DomainSelector from './DomainSelector';
import { Header } from '../Page';
import { FormInput, FormTextArea } from '../Form';
import Button from '../Button';
import NumberInput from '../NumberInput';
import { createTask, createTaskSuccess } from '../../actions';
import { usePrevious } from '../../utils/hooks';

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
  assignee: {
    changed: false,
  },
};

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
  createTaskSuccess,
}) => {
  const [state, dispatch] = useReducer(reducer, task);
  const { amount, title, description, domain, assignee } = state;

  const handleChange = event => {
    const { id, value } = event.target;

    dispatch({ type: 'handleChange', id, value });
  };

  const prevTransactionStatus = usePrevious(transactionStatus);

  if (
    prevTransactionStatus !== transactionStatus &&
    transactionStatus === 'success'
  ) {
    // TODO: Move listener to related saga
    // calling reload tasks
    createTaskSuccess();
  }

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
      <FormInput
        id="assignee"
        onChange={handleChange}
        type="text"
        label="assignee:"
        value={assignee.value}
        width="100%"
        focusable
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
          task.transactionKey !== undefined &&
          drizzleState.transactionStack[task.transactionKey]
        ) {
          const txHash = drizzleState.transactionStack[task.transactionKey];
          transactionStatus = drizzleState.transactions[txHash].status;
          // TODO: If status changed fetch tasks another time and reset form
        } else {
          transactionStatus = undefined;
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
  { createTask, createTaskSuccess },
)(DrizzleCreateTask);
