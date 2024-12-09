import pandas as pd
from config import google_spreadsheets_client


def read_google_sheet_to_dfs(sheet_id):
    print(f"Reading Google Sheet with ID: {sheet_id}")
    sheet = google_spreadsheets_client.open_by_key(sheet_id)
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

def create_google_sheet_with_permissions(sheet_title, gmail_accounts, tabs_data):
    # Create a new Google Sheet
    spreadsheet = google_spreadsheets_client.create(sheet_title)
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