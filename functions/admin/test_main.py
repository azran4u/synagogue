# test_main.py
from main import controller
from werkzeug.test import EnvironBuilder
from werkzeug.wrappers import Request

# Create a mock request
builder = EnvironBuilder(method="GET", path="/health")
env = builder.get_environ()
mock_request = Request(env)


# Call the function
response = controller(mock_request)

# Print the response
print(response.get_data(as_text=True))
