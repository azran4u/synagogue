from datetime import datetime
import gspread
import pandas as pd
import os
from google.cloud import firestore
from PIL import Image
import firebase_admin
from firebase_admin import credentials, storage

sheet_id = "1n0O47l7KFeNS6bOd3aVu2iq5AZxoaGYllNgp9OSwuUY"
firebase_credentials_file = os.path.join(
    os.path.dirname(__file__), "service_account_firebase.json"
)
gspread_service_account_file = os.path.join(
    os.path.dirname(__file__), "service_account_gspread.json"
)
firestore_project_id = "shomron-tights"
images_path = "/Users/eyalazran/Downloads/app_images/test"


if os.path.exists(firebase_credentials_file):
    print(f"Using credentials file: {firebase_credentials_file}")
    cred = credentials.Certificate(firebase_credentials_file)
    print(f"credentials were loaded successfully")

    print(f"Initializing Firebase app with project ID: {firestore_project_id}")
    firebase_admin.initialize_app(
        cred, {"storageBucket": "shomron-tights.firebasestorage.app"}
    )
    print(f"Firebase app initialized successfully")

    print(f"Initializing Firestore client with project ID: {firestore_project_id}")
    firestore_db = firestore.Client.from_service_account_json(
        firebase_credentials_file, project=firestore_project_id
    )
    print(f"Firestore client initialized successfully")

    print(
        f"Initializing Google Sheets client with service account file: {gspread_service_account_file}"
    )
    gc = gspread.service_account(filename=gspread_service_account_file)
    print(f"Google Sheets client initialized successfully")
else:
    print(f"Credentials file not found: {firebase_credentials_file}")
    exit(1)


def export_firestore_to_excel():
    base_url = "https://shomron-tights.web.app"
    collection_name = "orders"
    orders = read_firestore_collection(collection_name)

    orders_list = []
    products_list = []
    for order in orders:
        order_id = order.get("id")
        order_date = order.get("date")
        order_comments = order.get("comments")
        order_email = order.get("email")
        order_first_name = order.get("firstName")
        order_last_name = order.get("lastName")
        order_phone_number = order.get("phoneNumber")
        order_preffered_pickup_location = order.get("prefferedPickupLocation")
        order_sale_name = order.get("saleName")
        order_status = order.get("status")
        order_total_price = order.get("totalCost")
        order_total_cost_after_discount = order.get("totalCostAfterDiscount")
        products = order.get("products", [])
        order_entry = {
            "id": order_id,
            "url": f"{base_url}/order/{order_id}",
            "date": order_date,
            "comments": order_comments,
            "email": order_email,
            "first_name": order_first_name,
            "last_name": order_last_name,
            "phone_number": order_phone_number,
            "preffered_pickup_location": order_preffered_pickup_location,
            "sale_name": order_sale_name,
            "status": order_status,
            "total_price": order_total_price,
            "total_cost_after_discount": order_total_cost_after_discount,
        }
        orders_list.append(order_entry)
        for row in products:
            amount = row.get("amount")
            product = row.get("product")
            product_entry = {
                "first_name": order_first_name,
                "last_name": order_last_name,
                "phone_number": order_phone_number,
                "pickup_location": order_preffered_pickup_location,
                "description": product.get("id"),
                "amount": amount,
                "comments": order_comments,
            }
            products_list.append(product_entry)

    orders_df = pd.DataFrame(orders_list)
    products_df = pd.DataFrame(products_list)

    sheet_title = "shomron-tights" + "@" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gmail_accounts = ["azran4u@gmail.com"]

    # Dictionary of tab names and DataFrames
    tabs_data = {"orders": orders_df, "pack": products_df}

    # Create the Google Sheet and set permissions
    spreadsheet = create_google_sheet_with_permissions(sheet_title, gmail_accounts, tabs_data)
    return spreadsheet.url


def read_firestore_collection(collection_name):
    try:
        collection_ref = firestore_db.collection(collection_name)
        docs = collection_ref.stream()
        documents = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict["_id"] = doc.id  # Include the document ID in the dictionary
            documents.append(doc_dict)
        return documents
    except Exception as e:
        print(f"Error reading Firestore collection: {e}")
        return []


def create_google_sheet_with_permissions(sheet_title, gmail_accounts, tabs_data):
    # Create a new Google Sheet
    spreadsheet = gc.create(sheet_title)
    print(f"Created new Google Sheet: {spreadsheet.url}")

    # Add tabs and populate them with the content of the DataFrames
    for tab_name, df in tabs_data.items():
        worksheet = spreadsheet.add_worksheet(
            title=tab_name, rows=str(len(df) + 1), cols=str(len(df.columns))
        )
        worksheet.update([df.columns.values.tolist()] + df.values.tolist())
        print(f"Added tab: {tab_name}")

    # Remove the default sheet created with the spreadsheet
    default_sheet = spreadsheet.sheet1
    spreadsheet.del_worksheet(default_sheet)

    # Set permissions for the specified Gmail accounts
    for email in gmail_accounts:
        spreadsheet.share(email, perm_type="user", role="writer")
        print(f"Granted write access to: {email}")

    return spreadsheet


def sync_excel_to_firestore():
    print("Syncing Excel to Firestore")
    collections_to_delete = [
        "prodcuts",
        "colors",
        "pickups",
        "sales",
        "admins",
        "contact",
    ]
    for collection in collections_to_delete:
        delete_collection(collection)

    sheet = read_google_sheet(sheet_id)
    dataframes = read_google_sheet_to_dfs(sheet)
    save_dfs_to_firestore(dataframes)


def upload_images_to_firestore():
    for root, _, files in os.walk(images_path):
        for file in files:
            if file.lower().endswith(("png", "jpg", "jpeg", "gif", "bmp")):
                file_path = os.path.join(root, file)
                destination_blob_name = f"images/{file}"
                upload_image_to_firebase_storage(file_path, destination_blob_name)


def save_dfs_to_firestore(dataframes):
    print("Saving DataFrames to Firestore")
    for tab_name, df in dataframes.items():
        print(f"Processing DataFrame for tab: {tab_name}")
        id_fields = {
            "tights": ["denier", "leg", "size", "color"],
            "lace": ["lace", "color"],
            "short": ["length", "color"],
            "thermal": ["leg", "size", "color"],
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
            df["kind"] = tab_name
            if (
                tab_name == "tights"
                or tab_name == "lace"
                or tab_name == "short"
                or tab_name == "thermal"
            ):
                collection_name = "products"
            else:
                collection_name = tab_name
            write_df_to_firestore(df, collection_name, "id")
        else:
            print(f"Skipping tab: {tab_name}")
        print(f"DataFrame for tab: {tab_name} saved successfully")


def read_google_sheet(sheet_id):
    print(f"Reading Google Sheet with ID: {sheet_id}")
    sheet = gc.open_by_key(sheet_id)
    return sheet


def print_dataframes(dataframes):
    for tab_name, df in dataframes.items():
        print(f"DataFrame for tab: {tab_name}")
        write_df_to_firestore(df, tab_name)


def read_google_sheet_to_dfs(sheet):
    print("Reading Google Sheet to DataFrames")
    worksheet_list = sheet.worksheets()
    dfs = {}
    for worksheet in worksheet_list:
        print(f"Reading worksheet: {worksheet.title}")
        tab_name = worksheet.title
        data = worksheet.get_all_records()
        df = pd.DataFrame(data)
        if tab_name == "contact":
            pd.set_option("display.max_rows", None)
            pd.set_option("display.max_columns", None)
            print(df)
        dfs[tab_name] = df
    print("DataFrames read successfully")
    return dfs


def delete_collection(collection_name, batch_size=100):
    print(f"Deleting collection: {collection_name}")
    collection_ref = firestore_db.collection(collection_name)

    def delete_batch(collection_ref):
        docs = collection_ref.limit(batch_size).stream()
        deleted = 0

        for doc in docs:
            doc.reference.delete()
            deleted += 1

        return deleted

    while True:
        deleted = delete_batch(collection_ref)
        if deleted == 0:
            break

    print(f"Collection '{collection_name}' deleted successfully")


def write_df_to_firestore(df, collection_name, id_column=None):

    # Reference to the Firestore collection
    collection_ref = firestore_db.collection(collection_name)

    # Write each row in the DataFrame to the Firestore collection
    for index, row in df.iterrows():
        if id_column and id_column in df.columns:
            doc_id = str(row[id_column])
        else:
            doc_id = str(index)
        doc_ref = collection_ref.document(doc_id)
        doc_ref.set(row.to_dict())


def downscale_images(input_path, desktop_size=(1920, 1080), mobile_size=(720, 1280)):
    for root, _, files in os.walk(input_path):
        for file in files:
            if file.lower().endswith(("png", "jpg", "jpeg", "gif", "bmp")):
                file_path = os.path.join(root, file)
                with Image.open(file_path) as img:
                    # Downscale for desktop
                    img_desktop = img.copy()
                    img_desktop.thumbnail(desktop_size, Image.Resampling.LANCZOS)
                    desktop_output_path = os.path.join(root, f"desktop_{file}")
                    img_desktop.save(desktop_output_path, optimize=True, quality=85)

                    # Downscale for mobile
                    img_mobile = img.copy()
                    img_mobile.thumbnail(mobile_size, Image.Resampling.LANCZOS)
                    mobile_output_path = os.path.join(root, f"mobile_{file}")
                    img_mobile.save(mobile_output_path, optimize=True, quality=85)


def delete_all_images_in_specific_folder(bucket_name, folder_name):
    # client = storage.Client()
    bucket = storage.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=folder_name)

    for blob in blobs:
        blob.delete()

    print(f"All images deleted from folder '{folder_name}' in bucket: {bucket_name}")


def upload_image_to_firebase_storage(file_path, destination_blob_name):
    bucket = storage.bucket()
    blob = bucket.blob(destination_blob_name)

    # Set cache control metadata
    blob.cache_control = "public, max-age=3600, s-maxage=600"

    # Upload the file
    blob.upload_from_filename(file_path)

    # Make the blob publicly viewable
    blob.make_public()

    print(f"File uploaded to {blob.public_url}")


def colors():
    colors = {
        "שחור": "#000000",
        "לבן": "#FFFFFF",
        "שמנת": "#FFFDD0",
        "גוף": "#FFE4C4",
        "חום": "#8B4513",
        "כחול כהה": "#00008B",
        "כחול גי'נס": "#5D76A9",
        "כחול רוייאל": "#4169E1",
        "כסף": "#C0C0C0",
        "אפור בהיר": "#D3D3D3",
        "אפור כהה": "#A9A9A9",
        "טורקיז": "#40E0D0",
        "ירוק זית": "#808000",
        "ירוק כהה": "#006400",
        "ירוק צ'אן": "#00A86B",
        "חרדל": "#FFDB58",
        "סגול כהה": "#4B0082",
        "בורדו": "#800020",
        "אדום יין": "#8B0000",
        "ורוד עתיק": "#D3A9A9",
        "ורוד ביבי": "#FFC0CB",
        "תכלת": "#ADD8E6",
        "חמרה": "#A52A2A",
    }

    # Create a DataFrame from the dictionary
    df = pd.DataFrame(list(colors.items()), columns=["name", "hex_color"])
    df["id"] = df["name"]
    df["kind"] = "colors"

    # save the df to csv
    df.to_csv("colors.csv", index=False)
