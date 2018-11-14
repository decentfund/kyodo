pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../lib/colonyNetwork/contracts/IColony.sol";
import "./Ownable.sol";


contract DomainsV1 is Ownable {
  using SafeMath for uint256;

  struct Domain {
    string code;
    uint id;
  }

  Domain[] public domains;
  uint[] public distribution;
  bool internal _initialized;

  event NewDomainAdded(string _code, uint _id);

  /**
   * @dev Add domain to colony and store in kyodo contract.
   * @param _code Domain code to store
   */
  function addDomain(string _code) external onlyOwner {
    uint domainId = domains.length.add(1);
    Domain memory domain = Domain(_code, domainId);
    domains.push(domain);

    emit NewDomainAdded(_code, domainId);
  }

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    distribution = [1, 1, 1, 1];
    _initialized = true;
  }

  /**
   * @dev Get added domains length.
   */
  function getDomainsLength() public view returns (uint) {
    return domains.length;
  }

  /**
   * @dev Get domain details by its index.
   * @param _index Domain index to retrieve
   */
  function getDomain(uint _index) public view returns (string, uint) {
    return (domains[_index].code, domains[_index].id);
  }

  // function getDomains()
    // public
    // returns (string[], uint[])
  // {
    // string[] memory codes = new string[](domains.length);
    // uint[] memory ids = new uint[](domains.length);
    
    // for (uint i = 0; i < domains.length; i++) {
      // Domain storage domain = domains[i];
      // codes[i] = domain.code;
      // ids[i] = domain.id;
    // }
    
    // return (codes, ids);
  // }

  function distributeTokens(address _colony, address _token, uint _amount) public onlyOwner {
    uint totalPower = 0;
    for (uint i=0; i < distribution.length; i++) {
      totalPower = totalPower.add(distribution[i]);
    }
    // IColony(_colony).moveFundsBetweenPots(1, 2, 1, _token);
    for (i = 0; i < distribution.length; i++) {
      IColony(_colony).moveFundsBetweenPots(1, i+2, distribution[i].mul(_amount).div(totalPower), _token);
    }
  }
}
