import React, { Component } from 'react';
import moment from 'moment';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import BillboardChart from 'react-billboardjs';
import 'react-billboardjs/lib/billboard.css';
import { StyledHeader } from './StyledSharedComponents';
import TokenBalance from './TokenBalance';
import { getBalances, getFundBaseBalance, getHistorical } from '../reducers';
import { loadHistoricalRates } from '../actions';
import { formatEur } from '../helpers/format';

const StyledTokenBalances = styled.div`
  flex-grow: 1;
`;

const StyledContainer = styled.div`
  display: flex;
`;

const StyledChartHolder = styled.div`
  width: 482px;
`;

const CHART_DATA = {
  x: 'x',
  columns: [],
  type: 'area',
};

const axis = {
  x: {
    type: 'timeseries',
    tick: {
      count: 4,
      format: '%Y-%m-%d',
    },
  },
  y: {
    tick: {
      format: function(x) {
        return formatEur(x);
      },
    },
  },
};

class MultisigBalance extends Component {
  componentDidMount() {
    this.props.loadHistoricalRates([
      'ETH',
      ...Object.keys(process.env.BALANCE),
    ]);
  }

  componentWillReceiveProps(props) {
    this.chartInstance.loadData({
      columns: [
        ['x', ...props.historical.map(d => moment(d.date).toDate())],
        ['EUR', ...props.historical.map(d => d.balanceEUR)],
      ],
    });
    this.chartInstance.chart.resize();
  }

  render() {
    return (
      <div>
        <StyledHeader>Fund stats</StyledHeader>
        <StyledContainer>
          <StyledTokenBalances>
            {this.props.balances
              .filter(({ balance }) => balance !== 0)
              .map(token => (
                <TokenBalance
                  {...token}
                  totalBalance={this.props.totalBalance}
                  key={token.ticker}
                />
              ))}
          </StyledTokenBalances>
          <StyledChartHolder>
            <BillboardChart
              data={CHART_DATA}
              ref={c => (this.chartInstance = c)}
              axis={axis}
              legend={{ show: false }}
            />
          </StyledChartHolder>
        </StyledContainer>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    balances: getBalances(state).sort(
      (a, b) => b.balance * b.tokenPrice - a.balance * a.tokenPrice,
    ),
    totalBalance: getFundBaseBalance(state),
    historical: getHistorical(state),
  };
};

export default drizzleConnect(MultisigBalance, mapStateToProps, {
  loadHistoricalRates,
});
