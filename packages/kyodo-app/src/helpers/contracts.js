import MembersContract from '@kyodo/contracts/build/contracts/MembersV1.json';
import PeriodsContract from '@kyodo/contracts/build/contracts/PeriodsV1.json';

const generateContractConfig = ({ event, web3, address }) => {
  let contractName, contractAbi;
  if (event === 'PeriodsAddressChanged') {
    contractName = 'Periods';
    contractAbi = PeriodsContract.abi;
  } else if (event === 'MembersAddressChanged') {
    contractName = 'Members';
    contractAbi = MembersContract.abi;
  }

  if (contractName) {
    const contractConfig = {
      contractName,
      web3Contract: new web3.eth.Contract(contractAbi, address),
    };
    return contractConfig;
  }
  return;
};

export default generateContractConfig;
