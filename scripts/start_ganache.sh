#!/bin/bash

# Move to Kyodo directory
cd packages/kyodo

# Start Ganache
ganache-cli -d --gasLimit 7000000 --acctKeys ganache-accounts.json --noVMErrorsOnRPCResponse
