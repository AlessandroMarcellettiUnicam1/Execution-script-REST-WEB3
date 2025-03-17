#!/usr/bin/env python3
"""
This script runs tests by invoking Node.js scripts (main.js and generateJSONs.js) and a Docker-based API.
It accepts various command-line flags to determine which test to perform and
how many iterations to execute. Each test type triggers a specific Node.js command
with appropriate parameters.
"""

import subprocess
import os
import sys
import time
import argparse

# Set up command-line argument parsing
parser = argparse.ArgumentParser(description="Run the API and Node.js script with specified iterations.")
parser.add_argument('-n', type=int, default=5, required=False, help="Number of iterations to run the process")
parser.add_argument('-t1', action='store_true', help="Number of writing participants X-ray test (from 2 to 10)")
parser.add_argument('-t2', action='store_true', help="Message size dimension X-ray test (from x1 to x9)")
parser.add_argument('-t3', action='store_true', help="Process size dimension X-ray test (from x1 to x10) ('Increased size dimension' test in the paper)")
parser.add_argument('-t4', action='store_true', help="Parallel split synth test (from x1 to x10)")
parser.add_argument('-t5', action='store_true', help="Parallel split and join synth test (from x1 to x10)")
parser.add_argument('-t6', action='store_true', help="Exclusive split synth test (from x1 to x10)")
parser.add_argument('-t7', action='store_true', help="Exclusive split and join synth test (from x1 to x10)")
parser.add_argument('-t8', action='store_true', help="Three state of the art processes test")
args = parser.parse_args()

success_count = 0  # Counts the number of successful iterations
total_iterations = args.n  # Total iterations as specified by the user

def run_iteration(iteration: int) -> bool:
    """
    Runs a single iteration of the test.
    
    The function:
      - Prints the interaction header.
      - Runs the Node.js JSON generation script depending on the active test flag.
      - Starts the confidentiality API process inside the Docker container.
      - Executes the main Node.js process to execute the test.
      - Terminates the API process and cleans up temporary log files.
      - Sends a POST request via curl to create again the Ganache log file.
      
    Args:
        iteration (int): The current iteration number.
        
    Returns:
        bool: True if the Node.js process returns an exit code of 0, False otherwise.
    """
    global success_count
    # Print a header for this iteration (using sun symbol: ☼)
    print(f'\n{chr(9728)}  Interaction {iteration} {chr(9728)}')
    
    # Check which test flag is active and run the corresponding JSON generation script
    if args.t1:
        # Test 1: Number of writing participants X-ray test (from 2 to 10)
        print(f'{chr(9728)}  Number of encrypters {encrypters} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-e", str(encrypters)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t2:
        # Test 2: Message size dimension X-ray test (from x1 to x9)
        print(f'{chr(9728)}  Number of duplications {duplication} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-d", str(duplication)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t3:
        # Test 3: Process size dimension X-ray test (from x1 to x10) ("Increased size dimension" test in the paper)
        print(f'{chr(9728)}  Number of loops {loop} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-l", str(loop)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t4:
        # Test 4: Parallel split synth test (from x1 to x10) (using input_Parallel_Split.json)
        print(f'{chr(9728)}  Number of parallel loops {loop} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input/input_Parallel_Split.json", "-v", str(loop)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t5:
        # Parallel split and join synth test (from x1 to x10) (using input_Parallel_Split_Join.json)
        print(f'{chr(9728)}  Number of parallel loops {loop} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input/input_Parallel_Split_Join.json", "-w", str(loop)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t6:
        # Test 6: Exclusive split synth test (from x1 to x10) (using input_Exclusive_Split.json)
        print(f'{chr(9728)}  Number of exclusive loops {loop} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input/input_Exclusive_Split.json", "-x", str(loop)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t7:
        # Test 7: Exclusive split and join synth test (from x1 to x10) (using input_Exclusive_Split_Join.json)
        print(f'{chr(9728)}  Number of exclusive loops {loop} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input/input_Exclusive_Split_Join.json", "-y", str(loop)],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    elif args.t8:
        # Test 8: Three state of the art processes test (using different file inputs)
        print(f'{chr(9728)}  Test {fileInput} {chr(9728)}')
        json_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", fileInput],
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        json_process.wait()
        
    # Start the API process inside the Docker container using WSL
    api_process = subprocess.Popen(
        ["wsl", "docker", "exec", "-w", "/MARTSIA-KoB-API/src/", "-it", "martsia_ethereum_container",
         "python3", "/MARTSIA-KoB-API/src/api.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Allow some time for the API to initialize
    time.sleep(2)
    
    # Start the main Node.js process and check for success
    node_success = False
    node_process = subprocess.Popen(
        ["node", "main.js", "-t", str(caseName), "-n", str(success_count+1)],
        stdout=sys.stdout,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    try:
        # Wait for the Node.js process to complete and capture its exit code
        node_exit_code = node_process.wait()
        node_success = (node_exit_code == 0)
    except Exception as e:
        print(f"Node.js error: {e}")
    finally:
        # Terminate the API process
        api_process.terminate()
        # Also kill any lingering API processes in the Docker container
        subprocess.run(
            ["wsl", "docker", "exec", "martsia_ethereum_container", "pkill", "-f", "api.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
    # Increment the success counter if the Node.js process succeeded
    if node_success:
        success_count += 1
        
    # Clean up: remove the first file from the Ganache temporary logs folder, if it exists
    folder_path = os.path.join("./Ganache_Temp_Logs")
    files = os.listdir(folder_path)
    if files:
        file_path = os.path.join(folder_path, files[0])
        os.remove(file_path)
        print(f"Deleted {file_path}")
    else:
        print("No file found in the folder.")
        
    # Send a POST request via curl (to create a new log file)
    subprocess.run(
        ['curl', '-X', 'POST', 'http://127.0.0.1:7545', '-H', 'Content-Type: application/json', 
         '-d', '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return node_success

# Set default case name
caseName = "baseCase"

# Execute test cases based on the specified command-line arguments
if args.t1:
    # Test 1: Number of writing participants X-ray test (from 2 to 10)
    caseName = "t1"
    encrypters = 2
    while encrypters < 11:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        encrypters += 1

elif args.t2:
    # Test 2: Message size dimension X-ray test (from x1 to x9)
    caseName = "t2"
    duplication = 1
    while duplication < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        duplication += 1

elif args.t3:
    # Test 3: Process size dimension X-ray test (from x1 to x10)
    caseName = "t3"
    loop = 0
    while loop < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

elif args.t4:
    # Test 4: Parallel split synth test (from x1 to x10)
    caseName = "t4"
    loop = 0
    while loop < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

elif args.t5:
    # Test 5: Parallel split and join synth test (from x1 to x10)
    caseName = "t5"
    loop = 0
    while loop < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

elif args.t6:
    # Test 6: Exclusive split synth test (from x1 to x10)
    caseName = "t6"
    loop = 0
    while loop < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

elif args.t7:
    # Test 7: Exclusive split and join synth test (from x1 to x10)
    caseName = "t7"
    loop = 0
    while loop < 10:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

elif args.t8:
    # Test 8: Three state of the art processes test
    caseName = "t8"
    loop = 0
    for fileInput in ["./data/input/input_1_X-ray.json", "./data/input/input_1_Retail.json", "./data/input/input_1_Incident.json"]:
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1

else:
    # Default test: run iterations without any special test flags
    for i in range(1, total_iterations + 1):
        run_iteration(i)
        if i < total_iterations:
            print("Cooling down...")
            time.sleep(3)

# Final summary and exit status
print(f"\n{success_count} iterations completed successfully!")
sys.exit(0 if success_count == total_iterations else 1)
