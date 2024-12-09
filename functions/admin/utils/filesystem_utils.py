import os
import shutil


def delete_local_folder_and_content(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
        print(f"Folder {folder_path} and all its contents have been deleted.")
    else:
        print(f"Folder {folder_path} does not exist.")
