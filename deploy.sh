#!/bin/bash

# read the service name to deploy from the first arg
SERVICE_NAME=$1

#  if the service name is empty, exit
if [ -z "$SERVICE_NAME" ]; then
  echo "Please provide a service name to deploy"
  exit 1
fi

# Source nvm script
export NVM_DIR="$HOME/.nvm"
# Load NVM (Node Version Manager) if available
NVM_SHELL_SCRIPT="$NVM_DIR/nvm.sh"
if [ -s "$NVM_SHELL_SCRIPT" ]; then
    # Source nvm silently to avoid auto-use warnings
    source "$NVM_SHELL_SCRIPT" 2>/dev/null
    # Check if nvm command exists after sourcing
    if ! command -v nvm &> /dev/null; then
        echo "Error: nvm command not found. Please install nvm first."
        exit 1
    fi
else
    echo "Error: nvm not found at $NVM_SHELL_SCRIPT. Please install nvm first."
    exit 1
fi

# Set Node version immediately to avoid auto-use issues
echo "Setting Node version to 20"
nvm use 20

# Save the current working directory
CWD=$(pwd)

# CURRENT_NODE_VERSION=$(nvm current)

function build-react-app() {
  echo "Building React app"
  npm install
  npm run build
}

function firebase-cli-node() {
  echo "Deploying to Firebase"
}

# if the service name is "frontend", deploy the frontend service
if [ "$SERVICE_NAME" == "customer-frontend" ]; then
  echo "Deploying frontend service"
  cd customer-frontend
  build-react-app
  firebase-cli-node
  firebase deploy --only hosting:customer-frontend
fi

# if the service name is "backend", deploy the backend service
if [ "$SERVICE_NAME" == "admin" ]; then
  echo "Deploying backend service admin"  
  cd functions/admin
  python3.11 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  firebase-cli-node
  firebase deploy --only functions:admin
fi

cd $CWD