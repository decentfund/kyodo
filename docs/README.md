<img align="center" src="./img/kyodo_logo.svg" />

# Kyodo

Contracts and web app to run Kyodo project.

## Installation

To run the whole Kyodo project you need to setup 3 projects:
- Kyodo (this repository) to setup colony, sign final tips, get your balance and view tasks progress
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
ganache-cli --gasLimit 7000000 -b 3
```

### Create initial distribution of tokens

```
cp migrations/deploy_parameters.example.json migrations/deploy_parameters.json
```

Change `deploy_parameters.json` to reflect the initial distribution you want or leave accounts section empty.

### Compile smart-contracts:
We implement ERC-20 token contract to bootstrap app based on OpenZeppelin ERC20 Mintable token and Ownable contracts, for working with strings we utilize strings.sol library.

```
truffle migrate --reset --compile-all
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

If you need to specify additional token balances you can do so by creating a `balances.json` file in the root of the project.
Tokens should be speficied in the form of `TICKER: BALANCE`, like `BTC: 1`
