pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract DecentToken is MintableToken {
  // Token Information
  string public constant name = "Decent Token";
  string public constant symbol = "DECENT";
  uint256 public constant decimals = 18;
}
