import MembersContract from '@kyodo/contracts/build/contracts/MembersV1.json';
import PeriodsContract from '@kyodo/contracts/build/contracts/PeriodsV1.json';

const generateContractConfig = ({
  contractName,
  contractAbi,
  web3,
  address,
}) => {
  const contractConfig = {
    contractName,
    web3Contract: new web3.eth.Contract(contractAbi, address),
  };
  return contractConfig;
};

const generateContractConfigFromEvent = ({ event, web3, address }) => {
  let contractName, contractAbi;
  if (event === 'PeriodsAddressChanged') {
    contractName = 'Periods';
    contractAbi = PeriodsContract.abi;
  } else if (event === 'MembersAddressChanged') {
    contractName = 'Members';
    contractAbi = MembersContract.abi;
  }

  if (contractName) {
    return generateContractConfig({ contractName, contractAbi, web3, address });
  }
  return;
};

const generateContractConfigFromName = ({
  name: contractName,
  web3,
  address,
}) => {
  let contractAbi;
  if (contractName === 'Periods') {
    contractAbi = PeriodsContract.abi;
  } else if (contractName === 'Members') {
    contractAbi = MembersContract.abi;
  }

  if (contractAbi) {
    return generateContractConfig({ contractName, contractAbi, web3, address });
  }
  return;
};

export default generateContractConfig;
export { generateContractConfigFromEvent, generateContractConfigFromName };
