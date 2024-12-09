import os
from google.cloud import storage as gcs_storage
from firebase_admin import credentials
import firebase_admin
from google.cloud import firestore
import gspread

input_google_sheet_id = "1n0O47l7KFeNS6bOd3aVu2iq5AZxoaGYllNgp9OSwuUY"
service_account_file = os.path.join(os.path.dirname(__file__), "service_account.json")
firebase_storage_bucket = "shomron-tights.firebasestorage.app"
firestore_project_id = "shomron-tights"
images_path = "/Users/eyalazran/Downloads/app_images/test"
base_frontend_url = "https://shomron-tights.web.app"

if os.path.exists(service_account_file):
    cloud_storage_client = gcs_storage.Client.from_service_account_json(
        service_account_file
    )
    print(f"Google Cloud Storage client initialized successfully")
    cred = credentials.Certificate(service_account_file)
    print(f"credentials were loaded successfully")
    firebase_admin.initialize_app(cred, {"storageBucket": firebase_storage_bucket})
    print(f"Firebase app initialized successfully")
    firestore_database_client = firestore.Client.from_service_account_json(
        service_account_file, project=firestore_project_id
    )
    google_spreadsheets_client = gspread.service_account(filename=service_account_file)
    print(f"Google Sheets client initialized successfully")
else:
    print(f"Service account file not found: {service_account_file}")
    exit(1)
