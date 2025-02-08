from datetime import datetime
from sync import product_short_description
from utils.google_sheet_utils import create_google_sheet_with_permissions
from utils.firestore_utils import read_firestore_collection
from config import base_frontend_url
import pandas as pd
import numpy as np


def current_sale():
    sales = read_firestore_collection("sales")
    current_sale = None
    for sale in sales:
        start_date_str = sale.get("start_date")
        end_date_str = sale.get("end_date")
        name = sale.get("name")

        date_format = "%d/%m/%Y %H:%M"
        start_date = datetime.strptime(start_date_str, date_format)
        end_date = datetime.strptime(end_date_str, date_format)
        current_date = datetime.now()
        if start_date <= current_date <= end_date:
            current_sale = name
            break
    return current_sale


def allowed_admins():
    print("Reading allowed admins")
    admins = read_firestore_collection("admins")
    allowed_admin = []
    for admin in admins:
        email = admin.get("email")
        allowed_admin.append(email)
    return allowed_admin

def normalize_df(df):
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(0, inplace=True)
    df = df.round(2)

def export_orders():
    orders = read_firestore_collection("orders")
    products = read_firestore_collection("products")    
    products_df = pd.DataFrame(products)
    products_df["short_description"] = products_df.apply(product_short_description, axis=1)

    orders_list = []
    packeging_list = []

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
        order_cart_products = order.get("products", [])
        total_amount = sum(product.get("amount", 0) for product in order_cart_products)

        order_entry = {
            "תאריך": order_date,
            "נקודת חלוקה": order_preffered_pickup_location,
            "שם פרטי": order_first_name,
            "שם משפחה": order_last_name,
            "מחיר לאחר הנחה": order_total_cost_after_discount,
            "כמות פריטים": total_amount,
            "טלפון נייד": order_phone_number,
            "הערות": order_comments,
            "האם נארז": "",
            "אמצעי תשלום": "",
            "למי שולם": "",
            "כתובת מייל": order_email,
            "קישור להזמנה": f"{base_frontend_url}/order/{order_id}",
            "שם מכירה": order_sale_name,
            "מחיר לפני הנחה": order_total_price,
        }
        orders_list.append(order_entry)

        for order_cart_product in order_cart_products:
            amount = order_cart_product.get("amount")
            product = order_cart_product.get("product")

            id = product.get("id")
            supplier = product.get("supplier")

            product_from_products = products_df[products_df["id"] == id].iloc[0]
            short_description = product_short_description(product_from_products)
            
            packaging_entry = {
                "שם פרטי": order_first_name,
                "שם משפחה": order_last_name,
                "טלפון נייד": order_phone_number,
                "נקודת חלוקה": order_preffered_pickup_location,
                "המוצר": short_description,
                "כמות": amount,
                "כמות פריטים בהזמנה": total_amount,
                "מחיר לאחר הנחה": order_total_cost_after_discount,
                "ארוז": "",
                "ספק": supplier,
            }
            packeging_list.append(packaging_entry)

    orders_df = pd.DataFrame(orders_list)
    packaging_df = pd.DataFrame(packeging_list)

    orders_groupby_pickup_df = (
        orders_df.groupby("נקודת חלוקה")
        .agg({"מחיר לפני הנחה": "sum", "מחיר לאחר הנחה": "sum", "כמות פריטים": "sum"})
        .reset_index()
    )
    orders_groupby_pickup_df["עמלה"] = orders_groupby_pickup_df["מחיר לאחר הנחה"] * 0.10
    
    orders_count = (
        orders_df.groupby("נקודת חלוקה").size().reset_index(name="מספר הזמנות")
    )
    
    orders_groupby_pickup_df = pd.merge(
        orders_groupby_pickup_df, orders_count, on="נקודת חלוקה"
    )
    orders_groupby_pickup_df["למי לשלם"] = ""

    suppliers_df = (
        packaging_df.groupby(["ספק", "המוצר"]).agg({"כמות": "sum"}).reset_index()
    )

    suppliers_with_products_df = pd.merge(suppliers_df, products_df, how="left", left_on=["המוצר", "ספק"], right_on=["short_description", "supplier"])

    suppliers_df = suppliers_with_products_df[["ספק", "המוצר", "כמות", "stock_liron", "stock_sharale", "units_in_package", "price"]]
    suppliers_df = suppliers_df.rename(columns={"stock_liron": "מלאי לירון", "stock_sharale": "מלאי שהרלה", "units_in_package": "יחידות באריזה", "price": "מחיר ליחידה"})
    suppliers_df["מלאי לירון"] = pd.to_numeric(suppliers_df["מלאי לירון"], errors='coerce').fillna(0).astype(int)
    suppliers_df["מלאי שהרלה"] = pd.to_numeric(suppliers_df["מלאי שהרלה"], errors='coerce').fillna(0).astype(int)
    suppliers_df["יחידות באריזה"] = pd.to_numeric(suppliers_df["יחידות באריזה"], errors='coerce').fillna(0).astype(int)
    suppliers_df["מחיר ליחידה"] = pd.to_numeric(suppliers_df["מחיר ליחידה"], errors='coerce').fillna(0).astype(int)

    suppliers_df["מלאי כולל"] = suppliers_df["מלאי לירון"] + suppliers_df["מלאי שהרלה"]
    suppliers_df["כמה יחידות להזמין"] = (suppliers_df["כמות"] - suppliers_df["מלאי כולל"]).clip(lower=0)
    suppliers_df["כמה אריזות להזמין"] = np.ceil(suppliers_df["כמה יחידות להזמין"] / suppliers_df["יחידות באריזה"]) 
    suppliers_df["כמות להזמנה"] = suppliers_df["כמה אריזות להזמין"] * suppliers_df["יחידות באריזה"]
    suppliers_df["ספייר"] = suppliers_df["כמות להזמנה"] - suppliers_df["כמה יחידות להזמין"]
    suppliers_df["עלות"] = suppliers_df["כמות להזמנה"] * suppliers_df["מחיר ליחידה"]
    normalize_df(suppliers_df)

    current_sale_name = current_sale()
    num_of_orders = len(orders_df)
    suppliers_total_cost = suppliers_df["עלות"].sum()
    orders_revenue_before_discounts = orders_df["מחיר לפני הנחה"].sum()
    orders_revenue_after_discounts = orders_df["מחיר לאחר הנחה"].sum()
    orders_groupby_pickup_df_without_revava_and_yakir = orders_groupby_pickup_df[~orders_groupby_pickup_df["נקודת חלוקה"].str.contains('רבבה|יקיר', na=False)]
    comissions_without_revava_and_yakir = orders_groupby_pickup_df_without_revava_and_yakir["עמלה"].sum()
    net_profit_before_tax = orders_revenue_after_discounts - suppliers_total_cost - comissions_without_revava_and_yakir

    general_df = pd.DataFrame(columns=['key', 'value'])
    general_df.loc[0] = ['מכירה נוכחית', current_sale_name]
    general_df.loc[1] = ['כמות הזמנות', num_of_orders]
    general_df.loc[2] = ['עלות ספקים', suppliers_total_cost]
    general_df.loc[3] = ['סכום הזמנות', orders_revenue_before_discounts]
    general_df.loc[4] = ['סכום הזמנות לאחר הנחה', orders_revenue_after_discounts]
    general_df.loc[5] = ['סכום עמלות ללא רבבה ויקיר', comissions_without_revava_and_yakir]
    general_df.loc[5] = ['רווח', net_profit_before_tax]

    general_df = general_df.rename(columns={"key": "נתון", "value": "ערך"})
    normalize_df(general_df)
    
    sheet_title = "shomron-tights" + "@" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gmail_accounts = allowed_admins()

    # Dictionary of tab names and DataFrames
    tabs_data = {
        "הזמנות": orders_df.sort_values(by=["נקודת חלוקה", "שם משפחה", "שם פרטי"], ascending=[True, True, True]),
        "אריזות": packaging_df.sort_values(by=["נקודת חלוקה", "שם משפחה", "שם פרטי", "המוצר"], ascending=[True, True, True, True]),
        "מכירות לפי ישוב": orders_groupby_pickup_df.sort_values(by=["נקודת חלוקה"], ascending=[True]),
        "ספקים": suppliers_df.sort_values(by=["ספק", "המוצר"], ascending=[True, True]),
        "כללי": general_df
    }

    # Create the Google Sheet and set permissions
    spreadsheet = create_google_sheet_with_permissions(
        sheet_title, gmail_accounts, tabs_data
    )
    return spreadsheet.url
