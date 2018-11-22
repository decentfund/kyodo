#!/bin/bash
network=$1

# rm -rf build

# Move to colonyNetwork directory
cd lib/colonyNetwork

# Compile and deploy colonyNetwork contracts
if [[ -n "$network" ]]; then
  ./node_modules/.bin/truffle migrate --network ropsten
else
  ./node_modules/.bin/truffle migrate --compile-all --reset
fi

cp -Rf ./build ../../
