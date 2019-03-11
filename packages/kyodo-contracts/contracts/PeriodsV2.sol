pragma solidity ^0.4.23;

import "./PeriodsV1.sol";


contract PeriodsV2 is PeriodsV1 {
  string public periodName;
  event PeriodNameSet(string _periodName);
  event NewPeriodStart(uint _periodId, string _periodName);

  /**
   * @dev Set period name used in event on new period start. Emit relevant event and store in the contract, .
   * @param _name Event name
   */
  function setPeriodName(string _name) public onlyOwner {
    periodName = _name;
    emit PeriodNameSet(_name);
  }

  /**
   * @dev Starts new period.
   */
  function startNewPeriod() public returns (uint256) {
    require(now > BokkyPooBahsDateTimeLibrary.addDays(currentPeriodStartTime, periodDaysLength));
    
    currentPeriodStartTime = now;
    currentPeriodStartBlock = block.number;
    emit NewPeriodStart(periods.length, periodName);
    periods.push(currentPeriodStartBlock);

    return currentPeriodStartTime;
  }

  /**
   * @dev Deprecating irrelavent function.
   * @param _token token address
   * @param _colony colony address
   */
  function startNewPeriod(address _token, address _colony) public returns (uint256) {
    revert("deprecated");
  }
}
