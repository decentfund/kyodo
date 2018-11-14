pragma solidity ^0.4.23;

import "./Ownable.sol";
import "./strings.sol";


contract MembersV1 is Ownable {
  using strings for *;

  // Defines Member type
  struct Member {
    string alias;
    bool whitelisted;
  }

  string[] public usedAliases;
  bool internal _initialized;
  mapping(address => Member) public whitelist;
  address[] public whitelistedAddresses;

  event NewAliasSet(address _address, string _alias);

  function setAlias(
    string _value
  )
    external
    isWhitelisted(msg.sender)
  {
    require(nickNameNotExist(_value));
    string storage prevValue = whitelist[msg.sender].alias;
    int prevIndex = getNickNameIndex(prevValue);
    whitelist[msg.sender].alias = _value;

    // update used aliases
    usedAliases.push(_value);

    // delete previous nickname
    if (prevIndex >= 0) {
      usedAliases[uint(prevIndex)] = usedAliases[usedAliases.length - 1];
      delete usedAliases[usedAliases.length - 1];
      usedAliases.length--;
    }

    // TODO:  Check if should mint
    // MintableToken(Token).mint(msg.sender, 100000);

    emit NewAliasSet(msg.sender, _value);
  }

  /**
   * @dev Adds list of addresses to whitelist. Not overloaded due to limitations with truffle testing.
   * @param _beneficiaries Addresses to be added to the whitelist
   */
  function addManyToWhitelist(address[] _beneficiaries) external onlyOwner {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelist[_beneficiaries[i]].whitelisted = true;
      whitelistedAddresses.push(_beneficiaries[i]);
    }
  }

  /**
   * @dev Removes single address from whitelist.
   * @param _beneficiary Address to be removed to the whitelist
   */
  function removeFromWhitelist(address _beneficiary) external onlyOwner {
    whitelist[_beneficiary].whitelisted = false;
  }

  function getMembersCount() public view returns (uint)
  {
    return whitelistedAddresses.length;
  }

  modifier notNull(address _address) {
    require(_address != 0);
    _;
  }

  function initialize(address owner) public {
    require(!_initialized);
    setOwner(owner);
    _initialized = true;
  }

  /**
   * @dev Adds single address to whitelist.
   * @param _beneficiary Address to be added to the whitelist
   */
  function addToWhitelist(
    address _beneficiary
  )
    public
    isNotWhitelisted(_beneficiary)
    notNull(_beneficiary)
    onlyOwner
  {
    whitelist[_beneficiary].whitelisted = true;
    whitelistedAddresses.push(_beneficiary);
  }

  // @dev Returns list of whitelistedAddresses.
  // @return List of whitelisted addresses.
  function getWhitelistedAddresses() public view returns (address[]) {
    return whitelistedAddresses;
  }

  // @dev Returns list of whitelistedAddresses.
  // @return List of whitelisted addresses.
  function getUsedAliasesLength() public view returns (uint) {
    return usedAliases.length;
  }

  function nickNameNotExist(string _value)
    public
    returns (bool)
  {
    for (uint i=0; i < usedAliases.length; i++) {
      if (usedAliases[i].toSlice().equals(_value.toSlice())) return false;
    }
    return true;
  }

  function getNickNameIndex(string _value)
    public
    view
    returns (int)
  {
    for (uint i=0; i < usedAliases.length; i++) {
      if (usedAliases[i].toSlice().contains(_value.toSlice())) return int(i);
    }
    return -1;
  }

  function getAlias(address _addr) public view returns (string)
  {
    return whitelist[_addr].alias;
  }

    /**
   * @dev Reverts if beneficiary is not whitelisted. Can be used when extending this contract.
   */
  modifier isWhitelisted(address _beneficiary) {
    require(whitelist[_beneficiary].whitelisted);
    _;
  }

    /**
   * @dev Reverts if beneficiary is not whitelisted. Can be used when extending this contract.
   */
  modifier isNotWhitelisted(address _beneficiary) {
    require(!whitelist[_beneficiary].whitelisted);
    _;
  }

}
