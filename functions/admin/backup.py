from datetime import datetime
from utils.google_sheet_utils import create_google_sheet_with_permissions
from utils.firestore_utils import read_firestore_collection
import pandas as pd


def backup():
    print("Backing up Firestore to Excel")
    backup_collections()

def convert_nested_objects_to_string(df):
    return df.map(lambda x: str(x) if isinstance(x, (list, dict)) else x)


def backup_collections():
    collections_to_backup = [
        "admins",
        "colors",
        "contact",
        "emails",
        "orders",
        "pickups",
        "products",
        "sales",
    ]
    tabs_data = {}
    for collection in collections_to_backup:
        data = read_firestore_collection(collection)
        print(f"Backing up {collection} collection")
        df = pd.DataFrame(data)
        df = df.fillna('')
        df = convert_nested_objects_to_string(df)
        print(f"{len(df)} records found for collection {collection}")
        tabs_data[collection] = df
    
    sheet_title = "shomron-tights" + "@" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gmail_accounts = ["azran4u@gmail.com"]
    spreadsheet = create_google_sheet_with_permissions(sheet_title, gmail_accounts, tabs_data)
    return spreadsheet.url

backup()