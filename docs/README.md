<img align="center" src="./img/kyodo_logo.svg" />

# Kyodo
**Kyodo**
Ethereum blockchain based web app, the crossplatform incentive tool for building crypto economy for DAO based on Impression revenue model. We build Kyodo to run Decent.Fund. 
As an organisational structure it's defined as Adhocracy
As a governance it has two models Democracy and Meritocracy.

Colony: Decent.Fund
**Decent.Fund mission** is to contribute to the mass adoption of the decentrilezed solutions, making the concepts of the new crypto economy closer to unchained world. According to the mission Decent.Fund focuses on following activities:

1. UI/UX design
2. Programming
3. Digital marketing
4. Research
5. Education
6. Fund management 

Decent.Find aims to grow the community of people who are interested in experiments in building the decentralized organization which embraces individual and social interests, economic efficiency and incentive mechanism for growing.

## Kyodo/Decent.Fund domain structure
![](https://i.imgur.com/ec7SFum.png)

## Smart contracts' relations
![](https://i.imgur.com/SQ1tplh.png)

## Task management models
There are two opposite models of the Task management in Kyodo:

1. Impression revenue model
The contribution is done without an inintial task setting. 
A contributor posts the contribution to Riot/Colony → Domain's members evaluate the contribution by tipping → send tips with Riot bot → the contributor gets his DF tokens

2. Task managment model
Everybody can iniciate task by staking DF token.
The process:
stake task → add task description → assign roles →  define amount of DF token to stake to participate → define reward tasks  → open task

## Installation
This is a monorepo for kyodo project consisting of 3 modules:
- Kyodo web app to setup colony, sign final tips, get your balance and view tasks progress
- Kyodo backend to run mongodb server and tipping watch within period
- Kyodo bot to run riot bot for task creation and instant tipping


### To setup web app

```
git clone https://github.com/decentfund/kyodo.git
cd kyodo
yarn
```

### Start ganache

```
yarn start_ganache
```

### Create initial distribution of tokens

```
cp packages/kyodo/migrations/deploy_parameters.example.json packages/kyodo/migrations/deploy_parameters.json
```

Change `deploy_parameters.json` to reflect the initial distribution you want or leave accounts section empty.

### Compile smart-contracts:
We implement ERC-20 token contract to bootstrap app based on OpenZeppelin ERC20 Mintable token and Ownable contracts, for working with strings we utilize strings.sol library.

```
yarn deploy_contracts
```

### Start frontend app

```
yarn start
```

Don't forget to switch Metamask network to localhost:8545


### Testing

```
// Truffle teste
npm run truffle:test

// App tests
npm run jest
```

### Setting up arbitrary token balances

If you need to specify additional token balances you can do so by creating a `balances.json` file in the root of the kyodo package
Tokens should be speficied in the form of `TICKER: BALANCE`, like `BTC: 1`
