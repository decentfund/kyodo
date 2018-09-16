#!/bin/bash
network=$1

# Compile and deploy Kyodo contracts
if [[ -n "$network" ]]; then
  ./node_modules/.bin/truffle migrate --network ropsten
else
  ./node_modules/.bin/truffle migrate --compile-all --reset
fi
