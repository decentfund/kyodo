import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getContract, getCurrentPeriodInfo, getPointsDistribution } from '../reducers';
import { loadPeriodTasks } from '../actions';

const Wrapper = styled.div``;

const Summary = styled.div`
  font-size: 24px;
`;

const ProgressBarWrapper = styled.div`
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 20px;
  height: 5px;
  background: white;
  overflow: hidden;
  width: 170px;
`;

const ProgressBar = styled.div`
  width: ${props => props.fraction * 100}%;
  border-right: 1px solid #000000;
  background: #bd6fd8;
  height: 5px;
`;

const Percent = styled.div`
  font-size: 11px;
  margin-top: 4px;
`;

const DomainsDistribution = styled.div``;

class PeriodDistributionSummary extends Component {
  state = {
    domainsLengthKey: null,
    domainsLength: null,
    domains: [],
    domainsKeys: [],
  };

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    this.props.loadPeriodTasks();
    const domainsLengthKey = this.contracts.Domains.methods.getDomainsLength.cacheCall();
    this.setState({ domainsLengthKey });
  }

  componentDidUpdate() {
    const { Domains } = this.props;
    const { domainsLengthKey, domainsLength, domains, domainsKeys } = this.state;

    if (domainsLength === null && domainsLengthKey && Domains && Domains.getDomainsLength[domainsLengthKey]){
      const domainsLength = Number(Domains.getDomainsLength[domainsLengthKey].value);
      const domainsKeysData = [];
      for (let i = 0; i < domainsLength; ++i) {
        domainsKeysData.push(this.contracts.Domains.methods.getDomain.cacheCall(i));
      }
      this.setState({ domainsLength, domainsKeys: domainsKeysData });
    }

    if (domainsLength && !domains.length && Domains.getDomain && Object.keys(Domains.getDomain).length === domainsLength) {
      const domainsData = [];
      for (let i = 0; i < domainsLength; ++i) {
        domainsData.push(Domains.getDomain[domainsKeys[i]].value);
      }
      this.setState({ domains: domainsData });
    }
  }

  render() {
    const { currentPeriod, pointsDistribution } = this.props;
    const { domainsLength, domains, domainsKeys } = this.state;
    const { currentBalance, initialBalance, periodTitle} = currentPeriod;
    const distributed = initialBalance - currentBalance;
    const fraction = (initialBalance > 0) ? distributed / initialBalance : 0;
    const inPercent = parseFloat(fraction * 100).toFixed(2);
    const total = 4800;

    const domainsData = [
      {title: 'BUILD', used: 743, unused: total - 743},
      {title: 'SOCIAL', used: 614, unused: total - 614},
      {title: 'FUND', used: 366, unused: total - 366},
      {title: 'GOV', used: 548, unused: total - 548},
    ];

    console.log('currentDomains', domains);
    console.log('pointsDistribution', pointsDistribution);
    // console.log('domainsLength', domainsLength);
    // console.log('domainsKeys', domainsKeys);

    /*
    my thoughts about how to build figures:
    say, one 10x10 pixel block = 5 points
    we have 2000 pts in the BUIDL domain
    2000 pts = 400 blocks
    bar side size = square root of 400 = 20, which is integer, no problems
    then we have 1000 pts in the SOCIAL domain
    1000 pts = 200 blocks
    bar side size = square root of 200 = 14.14
    Math.round() to 14
    increase the first multiplier, then the second multiplier, until the result exceeds 200:
    15x14 = 210 blocks
    draw bar 15 by 14 blocks, remove 10 blocks in the end
    */

    return (
      <Wrapper>
        <Summary>
          {distributed} of {initialBalance} points distributed in {periodTitle}
          <ProgressBarWrapper>
            <ProgressBar fraction={fraction} />
          </ProgressBarWrapper>
          <Percent>{inPercent}%</Percent>
        </Summary>
        <DomainsDistribution>
          {domainsData.map(data => (
            <div key={data.title}>{data.title}</div>
          ))}
        </DomainsDistribution>
      </Wrapper>
    );
  }
}

PeriodDistributionSummary.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  currentPeriod: getCurrentPeriodInfo(state),
  Domains: getContract('Domains')(state),
  pointsDistribution: getPointsDistribution(state),
});

export default drizzleConnect(PeriodDistributionSummary, mapStateToProps, { loadPeriodTasks });
