pragma solidity 0.4.24;

import "./Ownable.sol";
import "./KyodoDAO.sol";

contract KyodoDAO_V1 is KyodoDAO {
  // TODO: Move out to storage for upgradability
  string public name;

  function setName(string _name) public onlyOwner {
    name = _name;
  }
}
