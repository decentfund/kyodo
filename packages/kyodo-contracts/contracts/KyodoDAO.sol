pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./strings.sol";

contract KyodoDAO is Ownable {
  using strings for *;

  // Defines Member type
  struct Member {
    string alias;
    bool whitelisted;
  }

  string[] public usedAliases;
  mapping(address => Member) public whitelist;
  address[] whitelistedAddresses;
  address public Colony;
  MintableToken public Token;
  uint256 public currentPeriodStartTime;
  uint public currentPeriodStartBlock;
  uint public periodDaysLength;

  constructor(address _token) public {
    Token = MintableToken(_token);
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

  function getMembersCount() public view returns (uint)
  {
    return whitelistedAddresses.length;
  }

  function setColonyAddress(address _address) public onlyOwner {
    Colony = _address;
  }

  function nickNameNotExist(string _value)
    public
    returns (bool)
  {
    for (uint i=0; i < usedAliases.length; i++) {
      if (usedAliases[i].toSlice().contains(_value.toSlice())) return false;
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

  // TODO: multisig function
  function startNewPeriod() public onlyOwner returns (uint256) {
    currentPeriodStartTime = now;
    currentPeriodStartBlock = block.number;
    return currentPeriodStartTime;
  }

  // TODO: multisig function
  function setPeriodDaysLength(uint8 daysLength) public onlyOwner returns (uint) {
    periodDaysLength = daysLength;
    return periodDaysLength;
  }

  function setAlias(
    string _value
  )
    isWhitelisted(msg.sender)
    external
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

  modifier notNull(address _address) {
    require(_address != 0);
    _;
  }

  /**
   * @dev Adds single address to whitelist.
   * @param _beneficiary Address to be added to the whitelist
   */
  function addToWhitelist(address _beneficiary) external isNotWhitelisted(_beneficiary) notNull(_beneficiary) onlyOwner {
    whitelist[_beneficiary].whitelisted = true;
    whitelistedAddresses.push(_beneficiary);
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

}
