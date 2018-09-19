import React, { Component } from 'react';
import moment from 'moment';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import BillboardChart from 'react-billboardjs';
import './chart_theme.css';
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
    show: false,
    tick: {
      format: function(x) {
        return formatEur(x);
      },
    },
  },
};

const CHART_POINT = {
  r: 0,
  focus: {
    expand: {
      r: 2,
    },
  },
};

const CHART_TOOLTIP = {
  format: {
    title: x => moment(x).format('D MMM'),
    name: () => '',
  },
  contents: (data, defaultTitleFormat, defaultValueFormat, color) => {
    return `<div><div class="tooltip_date">${moment(data[0].x).format(
      'D MMM',
    )}</div><div>${formatEur(data[0].value)}</div></div>`;
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
              point={CHART_POINT}
              ref={c => (this.chartInstance = c)}
              axis={axis}
              legend={{ show: false }}
              tooltip={CHART_TOOLTIP}
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
