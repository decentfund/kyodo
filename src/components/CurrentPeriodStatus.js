import React from "react";
import styled from "styled-components";
import propTypes from "prop-types";
import dfToken from "./dftoken.svg";

const WrapperCurrentPeriodStatus = styled.div`
  border-top: 4px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-top: 10px;
`;
const StyledTop = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 24px;
  line-height: 28px;
`;
const StyledBottom = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 16px;
  line-height: 19px;
`;
const Bounty = styled.div`
  display: flex;
  align-content: baseline;
  font-size: 24px;
  line-height: 28px;
`;
const Light = styled.span`
  color: rgba(0, 0, 0, 0.07);
`;
const StyledTokenLogo = styled.img`
  width: 24px;
  margin: 0 8px 0 8px;
`;
const CurrentPeriodStatus = ({
  periodName,
  periodStart,
  periodEnds,
  periodBounty,
  tokenSymbol
}) => (
  <WrapperCurrentPeriodStatus>
    <StyledTop>
      {periodName}
      <Bounty>
        <Light>bounty</Light> <StyledTokenLogo src={dfToken} />
        {periodBounty} {tokenSymbol}
      </Bounty>
    </StyledTop>
    <StyledBottom>
      <p>
        {periodStart} - {periodEnds}
      </p>
      <p>3.37 ETH ~1,482€</p>
    </StyledBottom>
  </WrapperCurrentPeriodStatus>
);

CurrentPeriodStatus.defaultProps = {
  periodName: "Early Renaissance",
  periodStart: "12.07.2018",
  periodEnds: "26.07.2018",
  periodBounty: 1360,
  tokenSymbol: "DF"
};

CurrentPeriodStatus.propTypes = {
  periodName: propTypes.string,
  periodStart: propTypes.string,
  periodEnd: propTypes.string,
  periodBounty: propTypes.number,
  tokenSymbol: propTypes.string
};

export default CurrentPeriodStatus;
