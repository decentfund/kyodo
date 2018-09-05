# kyodo-backend

### Prerequisites

```
  yarn global add mongod
  mongod

  yarn global add ganache-cli
  yarn global add trufflepig
```

```
 git clone --recursive https://github.com/JoinColony/colonyNetwork.git
 cd colonyNetwork/
 git checkout b96b30603397b0a2cbcfa42e3fa6ab8d0c175142
 yarn

 ./node_modules/.bin/ganache-cli -d --gasLimit 7000000 --acctKeys ganache-accounts.json
 trufflepig --ganacheKeyFile ganache-accounts.json
```

### Installation

```
  git clone https://github.com/decentfund/kyodo-backend.git
  cd kyodo-backend
  yarn
  nodemon app.js
```

### Made with love, beer and coffee.
