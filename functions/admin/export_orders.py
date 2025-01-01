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
    collection_name = "orders"
    orders = read_firestore_collection(collection_name)
    # current_sale_name = current_sale()
    # current_sale_orders = [
    #     order for order in orders if order.get("saleName") == current_sale_name
    # ]

    current_sale_orders = orders

    orders_list = []
    products_list = []
    for order in current_sale_orders:
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
                    f"טייץ תחרה, תחרה {product.get('lace')} , מידה {product.get('size')}, צבע {product.get('color')}"
                )
            elif product.get("kind") == "short":
                description = f"טייץ קצר, אורך {product.get('length')}, מידה {product.get('size')} ,צבע {product.get('color')}"
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
    orders_count = (
        orders_df.groupby("נקודת חלוקה").size().reset_index(name="מספר הזמנות")
    )
    orders_groupby_pickup_df = pd.merge(
        orders_groupby_pickup_df, orders_count, on="נקודת חלוקה"
    )

    suppliers_df = (
        products_df.groupby(["ספק", "המוצר"]).agg({"כמות": "sum"}).reset_index()
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
