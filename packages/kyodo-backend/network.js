const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { TrufflepigLoader } = require("@colony/colony-js-contract-loader-http");
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");

const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider("http://localhost:8545/");

let colonyClient, wallet, adapter, networkClient;

exports.initiateNetwork = async () => {
  const { privateKey } = await loader.getAccount(0);
  wallet = new Wallet(privateKey, provider);
  adapter = new EthersAdapter({
    loader,
    provider,
    wallet
  });
  networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  return networkClient;
};
