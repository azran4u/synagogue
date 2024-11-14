from firebase_functions import https_fn
from firebase_admin import initialize_app
from handler import handler_hello_world

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    res = handler_hello_world()
    return https_fn.Response(res)
