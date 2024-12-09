from firebase_functions import https_fn
from utils.jwt_utils import verify_id_token_and_email
import flask
from flask_cors import CORS
from export_orders import export_orders, allowed_admins
from sync import sync

app = flask.Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.before_request
def before_request():
    print(f"before request: {flask.request.path} method: {flask.request.method}")
    if flask.request.method in ["get"] and flask.request.path in [
        "/sync",
        "/export",
    ]:
        print("verifying id token and email")
        allowed_emails = allowed_admins()
        response = verify_id_token_and_email(allowed_emails)
        if response:
            return response


@app.get("/health")
def hello():
    return flask.Response(status=201, response="ok")


@app.get("/sync")
def sync_resolver():
    try:
        sync()
        return flask.Response(status=201, response="success")
    except Exception as e:
        print(str(e))
        return https_fn.Response(str(e), status=500)


@app.get("/export")
def export_resolver():
    try:
        url = export_orders()
        return flask.Response(status=201, response=url)
    except Exception as e:
        print(str(e))
        return https_fn.Response(str(e), status=500)


@https_fn.on_request(
    timeout_sec=300,
    memory=512,
    max_instances=1,
)
def controller(req: https_fn.Request) -> https_fn.Response:
    try:
        with app.request_context(req.environ):
            return app.full_dispatch_request()
    except Exception as e:
        print(str(e))
        return https_fn.Response(str(e), status=500)
