from datetime import datetime
from utils.google_sheet_utils import create_google_sheet_with_permissions
from utils.firestore_utils import read_firestore_collection
from config import base_frontend_url
import pandas as pd


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


def export_orders():
    orders = read_firestore_collection("orders")
    products = read_firestore_collection("products")
    products_df = pd.DataFrame(products)

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
            short_description = product_from_products.get("short_description")
            
            pageging_entry = {
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
            packeging_list.append(pageging_entry)

    orders_df = pd.DataFrame(orders_list)
    pageging_df = pd.DataFrame(packeging_list)

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
        pageging_df.groupby(["ספק", "המוצר"]).agg({"כמות": "sum"}).reset_index()
    )

    suppliers_with_products_df = pd.merge(suppliers_df, products_df, how="left", left_on=["המוצר"], right_on=["short_description"])

    suppliers_df = suppliers_with_products_df[["ספק", "המוצר", "כמות", "stock_liron", "stock_sharale", "units_in_package"]]
    
    suppliers_df = suppliers_df.rename(columns={"stock_liron": "מלאי לירון", "stock_sharale": "מלאי שהרלה", "units_in_package": "יחידות באריזה"})
    
    sheet_title = "shomron-tights" + "@" + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gmail_accounts = allowed_admins()

    # Dictionary of tab names and DataFrames
    tabs_data = {
        "הזמנות": orders_df.sort_values(by=["נקודת חלוקה", "שם משפחה", "שם פרטי"], ascending=[True, True, True]),
        "אריזות": pageging_df.sort_values(by=["נקודת חלוקה", "שם משפחה", "שם פרטי", "המוצר"], ascending=[True, True, True, True]),
        "מכירות לפי ישוב": orders_groupby_pickup_df.sort_values(by=["נקודת חלוקה"], ascending=[True]),
        "ספקים": suppliers_df.sort_values(by=["ספק", "המוצר"], ascending=[True, True]),
    }

    # Create the Google Sheet and set permissions
    spreadsheet = create_google_sheet_with_permissions(
        sheet_title, gmail_accounts, tabs_data
    )
    return spreadsheet.url

export_orders()