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

            if tab_name == "products":
                df["short_description"] = df.apply(product_short_description, axis=1)

            write_df_to_firestore(df, collection_name, "id")
        else:
            print(f"Skipping tab: {tab_name}")

        print(f"DataFrame for tab: {tab_name} saved successfully")
    print("DataFrames saved to Firestore successfully")

def product_short_description(df):
    kind = df.get("kind")
    name = df.get("name")
    size = df.get("size")
    color = df.get("color")
    length = df.get("length")
    lace = df.get("lace")
    leg = df.get("leg")
    denier = df.get("denier")


    women_tights_name = "טייץ גרביון לנשים ונערות"
    girls_tights_name = "טייץ גרביון ילדות"
    girls_hebrew = "ילדות"
    lace_hebrew = "תחרה"
    tights_hebrew = "טייץ"
    thermal_hebrew = "טרמי"
    denier_hebrew = "דניר"
    with_leg_hebrew = "עם רגל"
    without_leg_hebrew = "ללא רגל"
    if leg == "leg":
        leg_label = with_leg_hebrew
    else:
        leg_label = without_leg_hebrew

    if kind == "tights" and name == women_tights_name:
        description = f"{denier} {denier_hebrew} {size} {leg_label} {color}"
    elif kind == "tights" and name == girls_tights_name:
        description = f"{girls_hebrew} {size} {leg_label} {color}"
    elif kind == "lace":
        description =f"{lace_hebrew} {lace} {size} {color}"                
    elif kind == "short":
        description = f"{tights_hebrew} {length} {color}"
    elif kind == "thermal":
        description = f"{thermal_hebrew} {size} {leg_label} {color}"
    else:
        print (f"ERROR - no description for kind {kind} and name {name}")
        exit(1)
    return description