from datetime import datetime
import gspread
import pandas as pd
import os
from google.cloud import firestore
from PIL import Image
import firebase_admin
from firebase_admin import credentials, storage
from google.cloud import storage as gcs_storage

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
    firestore_db = firestore.Client.from_service_account_json(
        service_account_file, project=firestore_project_id
    )
    gc = gspread.service_account(filename=service_account_file)
    print(f"Google Sheets client initialized successfully")
else:
    print(f"Service account file not found: {service_account_file}")
    exit(1)


def create_gcs_bucket(bucket_name):
    bucket = cloud_storage_client.bucket(bucket_name)
    if bucket.exists():
        print(f"Bucket {bucket_name} already exists.")
        return

    # Create the bucket with the specified location and storage class
    bucket.storage_class = "STANDARD"
    new_bucket = cloud_storage_client.create_bucket(bucket, location="me-west1")

    print(
        f"Bucket {new_bucket.name} created in {new_bucket.location} with storage class {new_bucket.storage_class}."
    )

    # Set the bucket's IAM policy to allow public access
    policy = new_bucket.get_iam_policy(requested_policy_version=3)
    policy.bindings.append(
        {
            "role": "roles/storage.objectViewer",
            "members": {"allUsers"},
        }
    )
    new_bucket.set_iam_policy(policy)
    print(f"Public access granted to bucket {new_bucket.name}.")

    # Set the ACL for the bucket to allow public access
    new_bucket.acl.all().grant_read()
    new_bucket.acl.save()
    print(f"Bucket {new_bucket.name} is now publicly accessible.")

    # Disable soft delete (Object Versioning)
    new_bucket.versioning_enabled = False
    new_bucket.patch()
    print(f"Soft delete (Object Versioning) disabled for bucket {new_bucket.name}.")

    # Disable replication
    new_bucket.iam_configuration.uniform_bucket_level_access_enabled = True
    new_bucket.patch()
    print(f"Replication disabled for bucket {new_bucket.name}.")


def upload_folder_content_to_cloud_storage(bucket_name, folder_path):
    bucket = cloud_storage_client.bucket(bucket_name)

    # Iterate over all files in the folder
    for root, _, files in os.walk(folder_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            blob_name = os.path.relpath(file_path, folder_path)
            blob = bucket.blob(blob_name)

            # Upload the file to the bucket
            blob.upload_from_filename(file_path)
            print(f"File {file_path} uploaded to {blob_name}.")


def allowed_admins():
    admins = read_firestore_collection("admins")
    allowed_admin = []
    for admin in admins:
        email = admin.get("email")
        allowed_admin.append(email)
    return allowed_admin


def export_firestore_to_excel():
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
        order_total_price = order.get("totalCost")
        order_total_cost_after_discount = order.get("totalCostAfterDiscount")
        products = order.get("products", [])
        total_amount = sum(product.get("amount", 0) for product in products)

        order_entry = {
            "תאריך": order_date,
            "נקודת חלוקה": order_preffered_pickup_location,
            "שם פרטי": order_first_name,
            "שם משפחה": order_last_name,
            "מחיר לפני הנחה": order_total_price,
            "מחיר לאחר הנחה": order_total_cost_after_discount,
            "כמות פריטים": total_amount,
            "טלפון נייד": order_phone_number,
            "הערות": order_comments,
            "כתובת מייל": order_email,
            "קישור להזמנה": f"{base_frontend_url}/order/{order_id}",
            "שם מכירה": order_sale_name,
        }
        orders_list.append(order_entry)

        for row in products:
            amount = row.get("amount")
            product = row.get("product")
            supplier = product.get("supplier")
            if product.get("kind") == "tights":
                description = f"טייץ גרביון, {product.get('denier')} דניר, {product.get('leg')} רגל, מידה {product.get('size')}, צבע {product.get('color')}"
            elif product.get("kind") == "lace":
                description = (
                    f"טייץ תחרה, תחרה {product.get('lace')} ,צבע {product.get('color')}"
                )
            elif product.get("kind") == "short":
                description = f"טייץ קצר, אורך {product.get('length')} ,צבע {product.get('color')}"
            elif product.get("kind") == "thermal":
                description = f"טייץ תרמי, {product.get('leg')} רגל, מידה {product.get('size')} , צבע {product.get('color')} "
            product_entry = {
                "שם פרטי": order_first_name,
                "שם משפחה": order_last_name,
                "טלפון נייד": order_phone_number,
                "נקודת חלוקה": order_preffered_pickup_location,
                "המוצר": description.strip(),
                "כמות": amount,
                "כמות פריטים בהזמנה": total_amount,
                "הערות": order_comments,
                "ספק": supplier,
            }
            products_list.append(product_entry)

    orders_df = pd.DataFrame(orders_list)
    products_df = pd.DataFrame(products_list)

    orders_groupby_pickup_df = (
        orders_df.groupby("נקודת חלוקה")
        .agg({"מחיר לפני הנחה": "sum", "מחיר לאחר הנחה": "sum", "כמות פריטים": "sum"})
        .reset_index()
    )
    orders_groupby_pickup_df["עמלה"] = orders_groupby_pickup_df["מחיר לאחר הנחה"] * 0.10

    suppliers_df = (
        products_df.groupby(["ספק", "המוצר"])
        .agg({"כמות פריטים בהזמנה": "sum"})
        .reset_index()
    )

    sheet_title = "shomron-tights" + "@" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gmail_accounts = allowed_admins()

    # Dictionary of tab names and DataFrames
    tabs_data = {
        "הזמנות": orders_df,
        "אריזות": products_df,
        "מכירות לפי ישוב": orders_groupby_pickup_df,
        "ספקים": suppliers_df,
    }

    # Create the Google Sheet and set permissions
    spreadsheet = create_google_sheet_with_permissions(
        sheet_title, gmail_accounts, tabs_data
    )
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
        raise e


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

    sheet = read_google_sheet(input_google_sheet_id)
    dataframes = read_google_sheet_to_dfs(sheet)
    save_dfs_to_firestore(dataframes)


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


def upload_images_to_firestore():
    for root, _, files in os.walk(images_path):
        for file in files:
            if file.lower().endswith(("png", "jpg", "jpeg", "gif", "bmp")):
                file_path = os.path.join(root, file)
                destination_blob_name = f"images/{file}"
                upload_image_to_firebase_storage(file_path, destination_blob_name)
