import gspread
import pandas as pd
import os
from google.cloud import firestore
from PIL import Image
import firebase_admin
from firebase_admin import credentials, storage

sheet_id = "1n0O47l7KFeNS6bOd3aVu2iq5AZxoaGYllNgp9OSwuUY"
credentials_file = "/Users/eyalazran/.config/gspread/service_account.json"
firestore_database = "config"
firestore_project_id = "shomron-tights"
google_photos_image_url = "https://photos.google.com/share/AF1QipPLq3S6uRyix5fXNB_vtzBNXRMjh5cCDyVPJIs3sXMlvC7MGdxQfBiolF99k14YXA/photo/AF1QipMqqMcb4HzERQ_EH11pihrN-TrW2_7VevXpzLD2"
images_path = "/Users/eyalazran/Downloads/app_images/test"


cred = credentials.Certificate(credentials_file)
firebase_admin.initialize_app(
    cred, {"storageBucket": "shomron-tights.firebasestorage.app"}
)

firestore_db = firestore.Client.from_service_account_json(
    credentials_file, project=firestore_project_id
)


def handler_hello_world():
    return "Hello from fn1"


def handler():
    # colors()
    # delete_all_images_in_specific_folder("shomron-tights.firebasestorage.app", "images")
    # upload_images_to_firestore()
    sync_excel_to_firestore()


def sync_excel_to_firestore():
    collections_to_delete = [
        "prodcuts",
        "colors",
        "pickups",
        "sales",
        "admins",
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


def read_google_sheet(sheet_id):
    gc = gspread.service_account()
    sheet = gc.open_by_key(sheet_id)
    return sheet


def print_dataframes(dataframes):
    for tab_name, df in dataframes.items():
        print(f"DataFrame for tab: {tab_name}")
        write_df_to_firestore(df, tab_name)


def read_google_sheet_to_dfs(sheet):
    worksheet_list = sheet.worksheets()
    dfs = {}
    for worksheet in worksheet_list:
        tab_name = worksheet.title
        data = worksheet.get_all_records()
        df = pd.DataFrame(data)
        dfs[tab_name] = df
    return dfs


def delete_collection(collection_name, batch_size=100):
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
