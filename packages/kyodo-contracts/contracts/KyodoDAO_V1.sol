pragma solidity 0.4.24;

import "./Ownable.sol";
import "./KyodoDAO.sol";
import "./DomainsV2.sol";


contract KyodoDAO_V1 is KyodoDAO {

  function addDomain(string _code) external onlyOwner {
    IColony(colony).addDomain(1);
    uint256 domainCount = IColony(colony).getDomainCount();
    uint256 skillId;
    uint256 potId;
    (skillId, potId) = IColony(colony).getDomain(domainCount);

    DomainsV2(domains).addDomain(_code, potId);
  }
}
