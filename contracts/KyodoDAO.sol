pragma solidity ^0.4.24;

contract KyodoDAO {
  mapping(string => address) aliases;

  function setAlias(
    string _value
  )
    external
  {
    aliases[_value] = msg.sender;
  }

  function getAlias(
    string _value
  )
    public
    view
    returns (address)
  {
    return aliases[_value];
  }

}
