from main import controller
from werkzeug.test import EnvironBuilder
from werkzeug.wrappers import Request

# test_main.py
# from upload_images import upload_images
# from sync import sync
# from export_orders import export_orders

# sync()
# sync()
# export()
# upload_images()

# Create a mock request
builder = EnvironBuilder(method="GET", path="/sync")
env = builder.get_environ()
mock_request = Request(env)
response = controller(mock_request)
print(response.get_data(as_text=True))
