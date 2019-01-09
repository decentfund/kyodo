#!/bin/bash

# Paths
ROOT_PATH=$(pwd)

# Log
log() {
  CYAN='\033[0;36m'
  NONE='\033[0m'
  echo "${CYAN}$1${NONE}"
}

# Initialize colonyNetwork submodule
log "Initializing colonyNetwork submodule..."
git submodule update --init --recursive

# Move to colonyNetwork directory
cd lib/colonyNetwork

# Install colonyNetwork dependencies
log "Installing colonyNetwork dependencies..."
yarn

# Provision colonyNetwork submodules
log "Provisioning colonyNetwork submodules..."
yarn run provision:token:contracts

# Compiling contracts and applying registry
# TODO: Move that stuff out
# cd ../../
# ./node_modules/.bin/truffle compile
# ./node_modules/.bin/apply-registry build/contracts
