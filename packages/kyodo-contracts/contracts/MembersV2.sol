pragma solidity 0.4.24;

import "./MembersV1.sol";


contract MembersV2 is MembersV1 {
  function setAlias(
    string _value
  )
    external
  {
    require(nickNameNotExist(_value));
    
    bool isAliasEmpty = _value.toSlice().empty();

    string storage prevValue = whitelist[msg.sender].alias;

    if (isAliasEmpty) {
      require(!prevValue.toSlice().empty());
    }

    int prevIndex = getNickNameIndex(prevValue);

    whitelist[msg.sender].alias = _value;

    // update used aliases
    if (!isAliasEmpty) {
      usedAliases.push(_value);
    }

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

}
