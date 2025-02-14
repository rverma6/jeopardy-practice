#!/usr/bin/env python
import kagglehub
import os
import shutil

print("Downloading the updated Jeopardy dataset from Kaggle...")
dataset_path = kagglehub.dataset_download("aravindram11/jeopardy-dataset-updated")
print("Dataset downloaded to:", dataset_path)

# Define the destination path in your server/data directory
current_dir = os.path.dirname(os.path.abspath(__file__))
destination_path = os.path.join(current_dir, 'server', 'data', 'jeopardy_data.json')

# Ensure the destination directory exists
os.makedirs(os.path.dirname(destination_path), exist_ok=True)

# Copy the downloaded file to your server/data directory
try:
    # If dataset_path is a directory, look for a JSON file
    if os.path.isdir(dataset_path):
        for file in os.listdir(dataset_path):
            if file.endswith('.json'):
                source_file = os.path.join(dataset_path, file)
                shutil.copy2(source_file, destination_path)
                print(f"Successfully copied dataset to: {destination_path}")
                break
    else:
        # If it's a file, copy it directly
        shutil.copy2(dataset_path, destination_path)
        print(f"Successfully copied dataset to: {destination_path}")
except Exception as e:
    print(f"Error copying file: {str(e)}")
    print(f"Please manually copy the JSON file from {dataset_path} to {destination_path}") 