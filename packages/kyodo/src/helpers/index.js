import web3 from 'web3';

export const isValidAddress = address => web3.utils.isAddress(address);
