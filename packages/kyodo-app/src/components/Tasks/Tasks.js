import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Header } from '../Page';
import { Header as TableHeader } from '../Table';
import Task from './Task';
import { getTasks } from '../../actions';
import { getPots, getRelevantTasks, tasksLoaded } from '../../reducers';
import { formatCurrency, formatDecimals } from '../../helpers/format';

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

class Tasks extends PureComponent {
  render() {
    const { items = {}, domains = [], pots, tasksLoaded } = this.props;
    const getDomainName = id => {
      const soughtDomain = domains.find(d => d.potId === id);
      if (soughtDomain) return soughtDomain.name;
      return null;
    };

    return (
      <div>
        <Header>Tasks</Header>
        <div>
          <TableHeader>
            <StyledTaskTitle>task</StyledTaskTitle>
            <StyledAssignee>assignee</StyledAssignee>
            <StyledDomainCode>domain</StyledDomainCode>
            <StyledTips>amount, DF</StyledTips>
          </TableHeader>
          {!tasksLoaded
            ? 'loading...'
            : Object.keys(items).map(id => (
                <Task
                  {...items[id]}
                  domain={getDomainName(items[id].domainId)}
                  key={id}
                  amount={
                    pots[items[id].potId] &&
                    formatCurrency(
                      formatDecimals(pots[items[id].potId].balance, 18),
                      'DF',
                    )
                  }
                />
              ))}
        </div>
        <div>Task count: {Object.keys(items).length}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  items: getRelevantTasks(state),
  domains: state.colony.domains,
  pots: getPots(state),
  tasksLoaded: tasksLoaded(state),
});

export default connect(
  mapStateToProps,
  { getTasks },
)(Tasks);
