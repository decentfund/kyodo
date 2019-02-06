pragma solidity 0.4.24;

import "./Ownable.sol";
import "./KyodoDAO.sol";
import "./DomainsV2.sol";
import "./OwnedUpgradeabilityProxy.sol";
import "../lib/colonyNetwork/contracts/IColony.sol";


contract KyodoDAO_V1 is KyodoDAO {
  string public name;

  function addDomain(string _code) external onlyOwner {
    IColony(colony).addDomain(1);
    uint256 domainCount = IColony(colony).getDomainCount();
    uint256 skillId;
    uint256 potId;
    (skillId, potId) = IColony(colony).getDomain(domainCount);

    DomainsV2(domains).addDomain(_code, potId);
  }

  function changeDomainsProxyOwner(address _owner) external onlyOwner {
    Ownable(domains).transferOwnership(_owner);
  }

  function changeMembersProxyOwner(address _owner) external onlyOwner {
    Ownable(members).transferOwnership(_owner);
  }

  function changePeriodsProxyOwner(address _owner) external onlyOwner {
    Ownable(periods).transferOwnership(_owner);
  }

  function setColonyAdmin(address _address) external onlyOwner {
    IColony(colony).setAdminRole(_address);
  }

  function createTask(uint domainId, bytes32 hash, uint amount) external onlyOwner {
    // create task
    // FIXME: Check specified domainId and amount
    // TODO: Check if potId is equal to domainId
    IColony(colony).makeTask(hash, domainId, 0, 0);

    // total tasks count
    uint256 taskCount = IColony(colony).getTaskCount();

    // get task id
    // FIXME: Check it is reliable number
    uint256 taskId = taskCount - 1;
    
    // get task pot id
    (, , , , , , uint256 taskPotId, , ) = IColony(colony).getTask(taskId);

    // move funds
    IColony(colony).moveFundsBetweenPots(domainId, taskPotId, amount, token);
  }

  function setName(string _name) public onlyOwner {
    name = _name;
  }
}
