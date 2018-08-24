#!/bin/bash

# Move to Kyodo directory
cd packages/kyodo

# Compile and deploy Kyodo contracts
./node_modules/.bin/truffle migrate --compile-all --reset
