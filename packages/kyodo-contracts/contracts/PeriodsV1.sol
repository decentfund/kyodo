pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../lib/colonyNetwork/contracts/IColony.sol";
import "../lib/BokkyPooBahsDateTimeLibrary/contracts/BokkyPooBahsDateTimeLibrary.sol";
import "./Ownable.sol";


contract PeriodsV1 is Ownable {
  using SafeMath for uint256;

  uint256 public currentPeriodStartTime;
  uint public currentPeriodStartBlock;
  uint public periodDaysLength;
  uint[] public periods;

  bool internal _initialized;

  event NewPeriodStart(uint _periodId);

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    periodDaysLength = 30;
    currentPeriodStartTime = 0;
    _initialized = true;
  }

  function startNewPeriod(address _token, address _colony) public returns (uint256) {
    require(now > BokkyPooBahsDateTimeLibrary.addDays(currentPeriodStartTime, periodDaysLength));
    
    currentPeriodStartTime = now;
    currentPeriodStartBlock = block.number;
    emit NewPeriodStart(periods.length);
    periods.push(currentPeriodStartBlock);

    return currentPeriodStartTime;
  }

  // TODO: multisig function
  function setPeriodDaysLength(uint8 daysLength) public onlyOwner returns (uint) {
    periodDaysLength = daysLength;
    return periodDaysLength;
  }
}
