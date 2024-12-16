# test_main.py

from sync import sync

sync()

# from export_orders import export_orders
# export()

# from upload_images import upload_images

# upload_images()

# from main import controller
# from werkzeug.test import EnvironBuilder
# from werkzeug.wrappers import Request
# builder = EnvironBuilder(method="GET", path="/sync")
# env = builder.get_environ()
# mock_request = Request(env)
# response = controller(mock_request)
# print(response.get_data(as_text=True))
