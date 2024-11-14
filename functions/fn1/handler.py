import gspread
import pandas as pd
import os
from google.cloud import firestore
from PIL import Image

sheet_id = "1n0O47l7KFeNS6bOd3aVu2iq5AZxoaGYllNgp9OSwuUY"
credentials_file = "/Users/eyalazran/.config/gspread/service_account.json"
firestore_database = "configuration"
firestore_project_id = "shomron-tights"
google_photos_image_url = "https://photos.google.com/share/AF1QipPLq3S6uRyix5fXNB_vtzBNXRMjh5cCDyVPJIs3sXMlvC7MGdxQfBiolF99k14YXA/photo/AF1QipMqqMcb4HzERQ_EH11pihrN-TrW2_7VevXpzLD2"
images_path = "/Users/eyalazran/Downloads/app_images"


def handler_hello_world():
    return "Hello from fn1"


def handler():
    # downscale_images(images_path)
    sheet = read_google_sheet(sheet_id)
    dataframes = read_google_sheet_to_dfs(sheet)
    save_dfs_to_firestore(dataframes)


def save_dfs_to_firestore(dataframes):
    for tab_name, df in dataframes.items():
        print(f"Processing DataFrame for tab: {tab_name}")
        if tab_name == "tights":
            columns_to_concatenate = ["product", "denier", "leg", "size", "color"]
            df["sku"] = df[columns_to_concatenate].astype(str).agg("_".join, axis=1)
            write_df_to_firestore(df, tab_name, "sku")


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


def write_df_to_firestore(df, collection_name, id_column=None):
    # Initialize Firestore client
    db = firestore.Client.from_service_account_json(
        credentials_file, project=firestore_project_id, database=firestore_database
    )

    # Reference to the Firestore collection
    collection_ref = db.collection(collection_name)

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
