import React, { Component } from "react";

// Import the prerequisites
const { providers, Wallet } = require("ethers");
const { default: EthersAdapter } = require("@colony/colony-js-adapter-ethers");
const { TrufflepigLoader } = require("@colony/colony-js-contract-loader-http");

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require("@colony/colony-js-client");
const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider("http://localhost:8545/");
//
// (async () => {
//   // Get the private key from the first account from the Truffle config
//   const { privateKey } = await loader.getAccount(0);
//
//   // Create a wallet with the private key (so we have a balance we can use)
//   const wallet = new Wallet(privateKey, provider);
//
//   // Create an adapter (powered by ethers)
//   const adapter = new EthersAdapter({
//     loader,
//     provider,
//     wallet
//   });
//
//   // Connect to ColonyNetwork with the adapter!
//   const networkClient = new ColonyNetworkClient({ adapter });
//   await networkClient.init();
//
//   // Create a new Token contract
//   const tokenAddress = await networkClient.createToken({
//     name: "SomeToken",
//     symbol: "SOME"
//   });
//
//   console.log(`SomeToken contract address: ${tokenAddress}`);
//   console.log(networkClient);
//
//   const colonyData = {
//     tokenAddress: tokenAddress // Address of the colony's native token
//   };
//   //Create a cool Colony!
//   const {
//     eventData: { colonyId, colonyAddress }
//   } = await networkClient.createColony.send(colonyData);
//   co
//   // Congrats, you've created a Colony!
//   console.log(colonyId, colonyAddress);
// })();

class Helloworld extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      privateKey: "",
      wallet: "",
      adapter: "",
      tokenAddress: "",
      colonyData: "",
      colonyId: "",
      colonyAddress: "",
      colonyClient: "",
      tasks: ""
    };
  }
  async generateColony(networkClient) {
    const {
      eventData: { colonyId, colonyAddress }
    } = await networkClient.createColony.send(this.state.colonyData);
    const colonyClient = await networkClient.getColonyClient(colonyId);
    this.setState({
      colonyId: colonyId,
      colonyAddress: colonyAddress,
      colonyClient: colonyClient
    });
    console.log("HERE", this.state);
  }
  async getAddress(networkClient) {
    const tokenAddress = await networkClient.createToken({
      name: "Ewwo Token",
      symbol: "EWWO"
    });
    this.setState({
      tokenAddress: tokenAddress,
      colonyData: { tokenAddress: tokenAddress }
    });
    this.generateColony(networkClient);
  }

  async setWallet(privateKey) {
    let wallet = new Wallet(privateKey, provider);
    let adapter = new EthersAdapter({
      loader,
      provider,
      wallet
    });
    this.setState({
      wallet: wallet,
      adapter: adapter
    });
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();
    this.setState({ networkClient: networkClient });
    this.getAddress(networkClient);
  }
  setUpEnvironment() {
    loader.getAccount(0).then(res => {
      this.setState({ privateKey: res });
      this.setWallet(res.privateKey);
    });
  }

  componentWillMount() {
    this.setUpEnvironment();
  }

  async setTask(event) {
    console.log("HANDLE", this.state.colonyClient);
    let task = await this.state.colonyClient.createTask.send({
      specificationHash: this.state.value,
      domainId: 1
    });
    console.log("TASK: ", task);
  }
  async getTask(id = 1) {
    let res = await this.state.colonyClient.getTask.call({ taskId: id });
    console.log(`TASK${id}: `, res);
    return res;
  }
  insertItem(i, array, item) {
    let newArray = array.slice();
    newArray.splice(i, 0, item);
    console.log("NEW ARRAY", newArray);
    return newArray;
  }
  async getTasks() {
    let tasks = await this.state.colonyClient.getTaskCount.call();
    console.log(tasks);
    let i = 1;
    let res = [];
    while (i <= tasks.count) {
      res = await this.insertItem(i, res, await this.getTask(i));
      i++;
    }
    this.setState({ tasks: res });
    console.log("RES", res);
  }

  // handleSubmit = event => {
  //   alert("A name was submitted: " + this.state.value);
  //   event.preventDefault();
  // };
  handleChange = event => {
    this.setState({ value: event.target.value });
  };
  render() {
    return (
      <div>
        <p>Hello Colony @ {this.state.colonyAddress}</p>
        <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <button onClick={() => this.setTask()}>Set new task</button>
        <button onClick={() => this.getTask()}>Get task</button>
        <button onClick={() => this.getTasks()}>Get all tasks</button>
        {this.state.tasks.length > 0 ? (
          this.state.tasks.map(el => <p key={el.id}>{el.specificationHash}</p>)
        ) : (
          <p>No tasks yet</p>
        )}
      </div>
    );
  }
}

export default Helloworld;
