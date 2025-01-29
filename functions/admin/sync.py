from utils.google_sheet_utils import read_google_sheet_to_dfs
from utils.firestore_utils import (
    delete_collection,
    write_df_to_firestore,
)
from config import input_google_sheet_id


def sync():
    print("Syncing Excel to Firestore")

    dataframes = read_google_sheet_to_dfs(input_google_sheet_id)
    delete_collections()
    save_dfs_to_firestore(dataframes)


def delete_collections():
    collections_to_delete = [
        "products",
        "colors",
        "pickups",
        "sales",
        "admins",
        "contact",
    ]
    for collection in collections_to_delete:
        delete_collection(collection)

def save_dfs_to_firestore(dataframes):
    print("Saving DataFrames to Firestore")
    for tab_name, df in dataframes.items():
        print(f"Processing DataFrame for tab: {tab_name}")
        id_fields = {
            "products": ["kind", "name","denier", "leg", "lace", "length", "size", "color"],            
            "colors": ["name"],
            "pickups": ["name"],
            "sales": ["name"],
            "admins": ["email"],
            "contact": ["first_name", "last_name"],
        }
        if tab_name in id_fields:
            columns_to_concatenate = id_fields[tab_name]
            df["id"] = (
                tab_name
                + "_"
                + df[columns_to_concatenate].astype(str).agg("_".join, axis=1)
            )            
            collection_name = tab_name
            write_df_to_firestore(df, collection_name, "id")
        else:
            print(f"Skipping tab: {tab_name}")
        print(f"DataFrame for tab: {tab_name} saved successfully")
    print("DataFrames saved to Firestore successfully")