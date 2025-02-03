#!/bin/sh
# This script updates the MY_TOKEN value in the config.json file

NEW_TOKEN=$1

# Path to the config.json file
CONFIG_FILE="/usr/src/app/src/assets/config.json"

# Check if a new token was provided
if [ -z "$NEW_TOKEN" ]; then
  echo "No token provided. Usage: ./update_token.sh <new_token_value>"
  exit 1
fi

# Use sed to update the MY_TOKEN value in config.json
sed -i "s/\"MY_TOKEN\": \".*\"/\"MY_TOKEN\": \"$NEW_TOKEN\"/" "$CONFIG_FILE"

echo "Updated MY_TOKEN in config.json to: $NEW_TOKEN"
