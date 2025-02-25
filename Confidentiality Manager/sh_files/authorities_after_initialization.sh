#!/bin/sh

# Base directory where authority folders are located
BASE_DIR="../databases"

# Variable to store the first IPFS hash found
first_ipfs_hash=""

# Flag to indicate if all hashes and keys are valid
all_valid=1

# Function to clean up and kill all python3 processes
cleanup() {
    echo "Stopping all running Python processes..."
    pkill -f python3
    exit
}

# Trap SIGINT (Ctrl+C) and call the cleanup function
trap cleanup INT

# Count total number of authorities
authority_count=0

# Iterate over directories matching the pattern "authority*"
for dir in "$BASE_DIR"/authority[0-9]*; do
    # Check if it is a directory
    if [ -d "$dir" ]; then
        authority_count=$((authority_count + 1))

        # Extract the authority number from the folder name
        authority_number=$(echo "$dir" | sed 's/.*authority//')

        # Construct the expected database file name
        db_file="$dir/authority${authority_number}.db"

        # Check if the database file exists
        if [ -f "$db_file" ]; then
            # SQL queries to check the "ipfs_file_link_hash" and keys in the relevant tables
            SQL_HASH_QUERY="SELECT ipfs_file_link_hash FROM public_parameters LIMIT 1;"
            SQL_PUBLIC_KEY_QUERY="SELECT ipfs_file_link_hash FROM public_keys LIMIT 1;"
            SQL_PRIVATE_KEY_QUERY="SELECT private_key FROM private_keys LIMIT 1;"

            # Execute the SQL queries using sqlite3 and capture the results
            ipfs_hash=$(sqlite3 "$db_file" "$SQL_HASH_QUERY")
            public_key=$(sqlite3 "$db_file" "$SQL_PUBLIC_KEY_QUERY")
            private_key=$(sqlite3 "$db_file" "$SQL_PRIVATE_KEY_QUERY")

            # Check if the IPFS hash is empty
            if [ -z "$ipfs_hash" ]; then
                echo "IPFS hash is empty in database: $db_file"
                all_valid=0
                break
            fi

            # If this is the first non-empty IPFS hash, store it
            if [ -z "$first_ipfs_hash" ]; then
                first_ipfs_hash="$ipfs_hash"
            elif [ "$first_ipfs_hash" != "$ipfs_hash" ]; then
                # If subsequent IPFS hashes don't match the first one, they are not equal
                echo "IPFS hashes do not match in database: $db_file"
                all_valid=0
                break
            fi

            # Check if public key is empty
            if [ -z "$public_key" ]; then
                echo "Public key is missing in database: $db_file"
                all_valid=0
                break
            fi

            # Check if private key is empty
            if [ -z "$private_key" ]; then
                echo "Private key is missing in database: $db_file"
                all_valid=0
                break
            fi

        else
            echo "Database file not found: $db_file"
            all_valid=0
            break
        fi
    fi
done

# Output the result
if [ "$all_valid" -eq 1 ]; then
    echo "All IPFS hashes are equal and all keys are present."
else
    echo "Validation failed: either IPFS hashes do not match or keys are missing."
    exit
fi

# Run the server_authority.py scripts for each authority found
current_authority=0

for dir in "$BASE_DIR"/authority[0-9]*; do
    if [ -d "$dir" ]; then
        # Extract the authority number from the folder name
        authority_number=$(echo "$dir" | sed 's/.*authority//')

        # Increment the current authority count
        current_authority=$((current_authority + 1))

        # Check if it's the last authority
        if [ "$current_authority" -eq "$authority_count" ]; then
            # Run the last server_authority.py script in the foreground
            python3 ../src/server_authority.py -a "$authority_number"
        else
            # Run the other server_authority.py scripts in the background
            python3 ../src/server_authority.py -a "$authority_number" &
        fi
    fi
done

