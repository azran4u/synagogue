# test_main.py
from handler import create_gcs_bucket, upload_folder_content_to_cloud_storage
from main import controller
from werkzeug.test import EnvironBuilder
from werkzeug.wrappers import Request



create_gcs_bucket("shomron-tights-test-bucket-1")
upload_folder_content_to_cloud_storage(
    "shomron-tights-test-bucket-1", "/Users/eyalazran/Downloads/app_images/test"
)

# Create a mock request
# builder = EnvironBuilder(method="GET", path="/health")
# env = builder.get_environ()
# mock_request = Request(env)
# response = controller(mock_request)
# print(response.get_data(as_text=True))
