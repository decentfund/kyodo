#!/bin/bash

rm -rf build

# Move to colonyNetwork directory
cd lib/colonyNetwork

# Compile and deploy colonyNetwork contracts
./node_modules/.bin/truffle migrate --compile-all --reset

cp -rf ./build/ ../../

# Move to Kyodo directory
cd ../../

# Compile and deploy Kyodo contracts
./node_modules/.bin/truffle migrate --compile-all --reset
