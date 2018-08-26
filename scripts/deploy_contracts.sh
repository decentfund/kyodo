#!/bin/bash

# Move to colonyNetwork directory
cd packages/colonyNetwork

# Compile and deploy colonyNetwork contracts
./node_modules/.bin/truffle migrate --compile-all --reset

# Move to Kyodo directory
cd ../kyodo

# Compile and deploy Kyodo contracts
./node_modules/.bin/truffle migrate --compile-all --reset
