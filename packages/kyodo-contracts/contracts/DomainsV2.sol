pragma solidity 0.4.24;

import "./DomainsV1.sol";


contract DomainsV2 is DomainsV1 {
  mapping(string => DomainV2) private domains;
  string[] public domainNames;
  uint public totalDistribution = 0;

  struct DomainV2 {
    uint potId;
    bool exists;
    uint distribution;
  }

  event DomainPotIdChanged(string _code, uint _id);

  modifier domainNotExist(string _code) {
    require(!domains[_code].exists, "domain-not-exist");
    _;
  }

  modifier domainExist(string _code) {
    require(domains[_code].exists, "domain-exist");
    _;
  }

  /**
    /
   * @param _code Domain code to store
   * @param _potId Colony potId to store
   */
  function addDomain(string _code, uint _potId) external domainNotExist(_code) onlyOwner {
    domains[_code].potId = _potId;
    domains[_code].exists = true;
    domains[_code].distribution = 1;
    totalDistribution += 1;
    domainNames.push(_code);

    emit NewDomainAdded(_code, _potId);
  }

  /**
   * @dev Overriding version 1 method.
   * @param _code Domain code to store
   */
  function addDomain(string _code) external onlyOwner {
    revert("deprecated");
  }

  /**
   * @dev Change potId for domain by its code.
   * @param _code Domain code to store
   * @param _newPotId Colony potId to store
   */
  function changeDomainPotId(string _code, uint256 _newPotId) external domainExist(_code) onlyOwner {
    domains[_code].potId = _newPotId;

    emit DomainPotIdChanged(_code, _newPotId);
  }

  /**
   * @dev Get added domains length.
   */
  function getDomainsLength() public view returns (uint) {
    return domainNames.length;
  }

  /**
   * @dev Get domain details by its code.
   * @param _code Domain index to retrieve
   */
  function getDomain(string _code) public view returns (string, uint256) {
    return (_code, domains[_code].potId);
  }

  /**
   * @dev Get domain details by its index.
   * @param _index Domain index to retrieve
   */
  function getDomain(uint _index) public view returns (string, uint) {
    revert("deprecated");
  }

  /**
   * @dev Distribute tokens between domains
   * @param _colony Colony address
   * @param _token Token address
   * @param _amount Amount of tokens to distribute
   */
  function distributeTokens(address _colony, address _token, uint _amount) public onlyOwner {
    for (uint i = 0; i < domainNames.length; i++) {
      uint _potId = domains[domainNames[i]].potId;
      uint _distribution = domains[domainNames[i]].distribution;
      IColony(_colony).moveFundsBetweenPots(1, _potId, _distribution.mul(_amount).div(totalDistribution), _token);
    }
  }
}
