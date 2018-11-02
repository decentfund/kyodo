import { providers, Wallet } from 'ethers';
import EthersAdapter from '@colony/colony-js-adapter-ethers';
import { TrufflepigLoader } from '@colony/colony-js-contract-loader-http';
import ColonyNetworkClient from '@colony/colony-js-client';

const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

let colonyClient, wallet, adapter, networkClient;

export const initiateNetwork = async () => {
  const { privateKey } = await loader.getAccount(0);
  wallet = new Wallet(privateKey, provider);
  adapter = new EthersAdapter({
    loader,
    provider,
    wallet,
  });
  networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  return networkClient;
};
