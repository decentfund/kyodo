pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract KyodoDAO is Ownable {
  // Defines Member type
  struct Member {
    string alias;
    bool whitelisted;
  }

  string[] usedAliases;
  mapping(address => Member) public whitelist;
  address[] whitelistedAddresses;
  MintableToken public Token;

  constructor(address _token) public {
    Token = MintableToken(_token);
  }

  function setAlias(
    string _value
  )
    isWhitelisted(msg.sender)
    // TODO: Is not present in whitelisted
    external
  {
    whitelist[msg.sender].alias = _value;
    usedAliases.push(_value);
    MintableToken(Token).mint(msg.sender, 100000);
  }

  function getAlias() public view returns (string)
  {
    return whitelist[msg.sender].alias;
  }

    /**
   * @dev Reverts if beneficiary is not whitelisted. Can be used when extending this contract.
   */
  modifier isWhitelisted(address _beneficiary) {
    require(whitelist[_beneficiary].whitelisted);
    _;
  }

  /**
   * @dev Adds single address to whitelist.
   * @param _beneficiary Address to be added to the whitelist
   */
  function addToWhitelist(address _beneficiary) external onlyOwner {
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
