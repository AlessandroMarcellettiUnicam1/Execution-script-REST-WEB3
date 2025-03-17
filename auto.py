import subprocess
import os
import sys
import time
import argparse

parser = argparse.ArgumentParser(description="Run the API and Node.js script with specified iterations.")
parser.add_argument('-n', type=int, default=5, required=False, help="Number of iterations to run the process")
parser.add_argument('-t1', action='store_true', help="Perform encryptors tests")
parser.add_argument('-t2', action='store_true', help="Perform message size tests")
parser.add_argument('-t3', action='store_true', help="Perform looping tests")
parser.add_argument('-t4', action='store_true', help="Perform first parallel tests")
parser.add_argument('-t5', action='store_true', help="Perform second parallel tests")
parser.add_argument('-t6', action='store_true', help="Perform first exclusive tests")
parser.add_argument('-t7', action='store_true', help="Perform second exclusive tests")
parser.add_argument('-t8', action='store_true', help="Perform 3 base cases test")
args = parser.parse_args()

success_count = 0
total_iterations = args.n

def run_iteration(iteration: int):
    global success_count
    print(f'\n{chr(9728)}  Interaction {iteration} {chr(9728)}')
    
    if args.t1:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of encrypters {encrypters} {chr(9728)}')
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-e", str(encrypters)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
        
    elif args.t2:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of duplications {duplication} {chr(9728)}')
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-d", str(duplication)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
        
    elif args.t3:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of loops {loop} {chr(9728)}')
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-l", str(loop)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    elif args.t4:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of parallel loops {loop} {chr(9728)}')    
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input_2.json", "-v", str(loop)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    elif args.t5:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of parallel loops {loop} {chr(9728)}')    
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input_3.json", "-w", str(loop)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    elif args.t6:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of exclusive loops {loop} {chr(9728)}')    
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input_4.json", "-x", str(loop)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    elif args.t7:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Number of exclusive loops {loop} {chr(9728)}')    
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", "./data/input_5.json", "-y", str(loop)],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    elif args.t8:
        # Start generateJSONs.js
        print(f'{chr(9728)}  Test {fileInput} {chr(9728)}')    
        JSON_process = subprocess.Popen(
            ["node", "generateJSONs.js", "-f", fileInput],
            cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
            stdout=sys.stdout,
            stderr=subprocess.STDOUT,
            text=True
        )
        JSON_process.wait()
    # Start API
    api_process = subprocess.Popen(
        ["wsl", "docker", "exec", "-w", "/MARTSIA-KoB-API/src/", "-it", "martsia_ethereum_container",
         "python3", "/MARTSIA-KoB-API/src/api.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for API
    time.sleep(2)
    
    # Start Node.js
    node_success = False
    node_process = subprocess.Popen(
        ["node", "main.js", "-t", str(caseName), "-n", str(success_count+1)],
        cwd=os.path.join(os.path.dirname(__file__), "Evaluation Tool"),
        stdout=sys.stdout,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    try:
        node_exit_code = node_process.wait()
        node_success = node_exit_code == 0
    except Exception as e:
        print(f"Node.js error: {e}")
    finally:
        # Terminate API
        api_process.terminate()
        subprocess.run(
            ["wsl", "docker", "exec", "martsia_ethereum_container", "pkill", "-f", "api.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
    if node_success:
        success_count += 1
    # Construct the folder path
    folder_path = os.path.join(os.path.expanduser("~"), "Desktop", "saving")
    
    # List all files in the folder (assuming there's only one file)
    files = os.listdir(folder_path)
    if files:
        file_path = os.path.join(folder_path, files[0])
        os.remove(file_path)
        print(f"Deleted {file_path}")
    else:
        print("No file found in the folder.")
        
    subprocess.run(
    ['curl', '-X', 'POST', 'http://127.0.0.1:7545', '-H', 'Content-Type: application/json', '-d', '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)
    return node_success


caseName = "baseCase"

if args.t1:
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
    caseName = "t8"
    loop = 0
    for e in ["./data/input_1.json", "./data/input_1_Retail.json", "./data/input_1_Incident.json"]:
        fileInput = e
        for i in range(1, total_iterations + 1):
            run_iteration(i)
            if i < total_iterations:
                print("Cooling down...")
                time.sleep(3)
        loop += 1
else:
    for i in range(1, total_iterations + 1):
        run_iteration(i)
        if i < total_iterations:
            print("Cooling down...")
            time.sleep(3)

print(f"\n{success_count} iterations completed successfully!")
sys.exit(0 if success_count == total_iterations else 1)