from utils.cloud_storage_utils import (
    create_gcs_bucket,
    delete_gcs_bucket,
    upload_folder_content_to_cloud_storage,
)
from utils.image_utils import downscale_images
from utils.filesystem_utils import delete_local_folder_and_content


def upload_images():
    images_path_input = "~/Downloads/tights-shomron-images"
    images_path_output = images_path_input + "uploaded"
    delete_local_folder_and_content(images_path_output)
    downscale_images(images_path_input, images_path_output)
    bucket_name = "shomron-tights-images"
    delete_gcs_bucket(bucket_name)
    create_gcs_bucket(bucket_name)
    upload_folder_content_to_cloud_storage(bucket_name, images_path_output)
