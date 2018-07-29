pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract DecentToken is MintableToken {
  // Token Information
  string public constant name = "D E C E N T . F U N D";
  string public constant symbol = "DF";
  uint256 public constant decimals = 18;
}
