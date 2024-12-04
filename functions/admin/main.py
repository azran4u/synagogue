from firebase_functions import https_fn
from firebase_admin import auth
from handler import (
    allowed_admins,
    export_firestore_to_excel,
    sync_excel_to_firestore,
)
import flask
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

allowed_emails = allowed_admins()


def verify_id_token_and_email():
    print(f"verifiying id token and email")
    id_token = flask.request.headers.get("Authorization")
    print(f"id_token: {id_token}")
    if not id_token:
        print("Missing Authorization header")
        raise Exception("Missing Authorization header")

    if id_token.startswith("Bearer "):
        print("Bearer token found")
        id_token = id_token.split("Bearer ")[1]

    try:
        print(f"verifying id token")
        decoded_token = auth.verify_id_token(id_token)
        print(f"decoded token: {decoded_token}")
        email = decoded_token.get("email")
        print(f"email: {email}")
        if email not in allowed_emails:
            print("Unauthorized Email")
            raise Exception("Unauthorized Email")
        return decoded_token, None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None, str(e)


@app.before_request
def before_request():
    print(f"before request: {flask.request.path}")
    print(f"method: {flask.request.method}")
    if flask.request.method in ["get"] and flask.request.path in [
        "/sync",
        "/export",
    ]:
        print(f"request path: {flask.request.path}")
        response = verify_id_token_and_email()
        if response:
            return response


@app.get("/health")
def hello():
    return flask.Response(status=201, response="ok")


@app.get("/sync")
def sync():
    try:
        sync_excel_to_firestore()
        return flask.Response(status=201, response="success")
    except Exception as e:
        print(str(e))
        return https_fn.Response(str(e), status=500)


@app.get("/export")
def export():
    try:
        url = export_firestore_to_excel()
        return flask.Response(status=201, response=url)
    except Exception as e:
        print(str(e))
        return https_fn.Response(str(e), status=500)


@https_fn.on_request()
def controller(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
