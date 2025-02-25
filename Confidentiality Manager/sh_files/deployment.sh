#!/bin/bash

cd ../blockchain

# Save the migration output to a variable (or read from a file)
migration_output=$(truffle migrate --network development)

# Extract the contract addresses using grep and awk
confidential_contract_address=$(echo "$migration_output" | grep -oP "contract address:\s*0x[0-9a-fA-F]{40}" | awk '{print $3}' | head -n 1)
state_contract_address=$(echo "$migration_output" | grep -oP "contract address:\s*0x[0-9a-fA-F]{40}" | awk '{print $3}' | tail -n 1)

sed -i "s|^CONTRACT_ADDRESS_MARTSIA=.*|CONTRACT_ADDRESS_MARTSIA=\"$confidential_contract_address\"|" ../src/.env
sed -i "s|^CONTRACT_ADDRESS_CHORCHAIN=.*|CONTRACT_ADDRESS_CHORCHAIN=\"$state_contract_address\"|" ../src/.env