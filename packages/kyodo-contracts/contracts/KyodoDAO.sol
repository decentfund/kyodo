pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../lib/BokkyPooBahsDateTimeLibrary/contracts/BokkyPooBahsDateTimeLibrary.sol";
import "../lib/colonyNetwork/contracts/IColony.sol";
import "../lib/colonyNetwork/lib/colonyToken/contracts/Token.sol";
import "./strings.sol";
import "./DomainsV1.sol";
import "./MembersV1.sol";
import "./PeriodsV1.sol";
import "./Ownable.sol";


contract KyodoDAO is Ownable {
  using strings for *;
  using SafeMath for uint256;

  address public colony;
  address public domains;
  address public members;
  address public periods;
  address public token;
  uint public inflationRate;
  bool internal _initialized;

  event ColonyAddressChanged(address _address);
  event DomainsAddressChanged(address _address);
  event PeriodsAddressChanged(address _address);
  event MembersAddressChanged(address _address);
  event TokenAddressChanged(address _address);
  event NewDomainAdded(string _code, uint _id);

  function addDomain(string _code) public onlyOwner {
    IColony(colony).addDomain(1);

    DomainsV1(domains).addDomain(_code);
    // emit NewDomainAdded(_code, 1);
  }

  /**
   * @dev Adds list of addresses to whitelist. Not overloaded due to limitations with truffle testing.
   * @param _beneficiaries Addresses to be added to the whitelist
   */
  function addManyToWhitelist(address[] _beneficiaries) public onlyOwner {
    MembersV1(members).addManyToWhitelist(_beneficiaries);
  }

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    // TODO: Find a proper place to define inflation rate
    inflationRate = 5;
    _initialized = true;
  }

  function setColonyAddress(address _address) public onlyOwner {
    colony = _address;
    emit ColonyAddressChanged(_address);
  }

  function setDomainsAddress(address _address) public onlyOwner {
    domains = _address;
    emit DomainsAddressChanged(_address);
  }

  function setPeriodsAddress(address _address) public onlyOwner {
    periods = _address;
    emit PeriodsAddressChanged(_address);
  }

  function setMembersAddress(address _address) public onlyOwner {
    members = _address;
    emit MembersAddressChanged(_address);
  }

  function setTokenAddress(address _address) public onlyOwner {
    token = _address;
    emit TokenAddressChanged(_address);
  }

  function startNewPeriod() public {
    PeriodsV1(periods).startNewPeriod(token, colony);

    // Mint tokens
    uint _totalSupply = ERC20Extended(token).totalSupply();
    uint _toMint = _totalSupply.mul(inflationRate).div(100);
    IColony(colony).mintTokens(_toMint);

    // Claim tokens
    IColony(colony).claimColonyFunds(token);

    DomainsV1(domains).distributeTokens(colony, token, _toMint);
  }

  function setPeriodDaysLength(uint8 _days) public onlyOwner {
    PeriodsV1(periods).setPeriodDaysLength(_days);
  }
}
