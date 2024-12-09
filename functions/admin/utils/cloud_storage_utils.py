from config import cloud_storage_client
import os


def delete_gcs_bucket(bucket_name):
    bucket = cloud_storage_client.bucket(bucket_name)
    if bucket.exists():
        bucket.delete(force=True)
        print(f"Bucket {bucket_name} deleted successfully.")
    else:
        print(f"Bucket {bucket_name} does not exist.")


def create_gcs_bucket(bucket_name):
    bucket = cloud_storage_client.bucket(bucket_name)
    if bucket.exists():
        print(f"Bucket {bucket_name} already exists.")
        return

    # Create the bucket with the specified location and storage class
    bucket.storage_class = "STANDARD"
    new_bucket = cloud_storage_client.create_bucket(bucket, location="me-west1")

    print(
        f"Bucket {new_bucket.name} created in {new_bucket.location} with storage class {new_bucket.storage_class}."
    )

    # Set the bucket's IAM policy to allow public access
    policy = new_bucket.get_iam_policy(requested_policy_version=3)
    policy.bindings.append(
        {
            "role": "roles/storage.objectViewer",
            "members": {"allUsers"},
        }
    )
    new_bucket.set_iam_policy(policy)
    print(f"Public access granted to bucket {new_bucket.name}.")

    # Set the ACL for the bucket to allow public access
    new_bucket.acl.all().grant_read()
    new_bucket.acl.save()
    print(f"Bucket {new_bucket.name} is now publicly accessible.")

    # Disable soft delete (Object Versioning)
    new_bucket.versioning_enabled = False
    new_bucket.patch()
    print(f"Soft delete (Object Versioning) disabled for bucket {new_bucket.name}.")

    # Disable replication
    new_bucket.iam_configuration.uniform_bucket_level_access_enabled = True
    new_bucket.patch()
    print(f"Replication disabled for bucket {new_bucket.name}.")


def upload_folder_content_to_cloud_storage(bucket_name, folder_path):
    bucket = cloud_storage_client.bucket(bucket_name)

    for root, _, files in os.walk(folder_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            # Preserve the folder structure by using the relative path
            blob_name = os.path.relpath(file_path, folder_path)
            blob = bucket.blob(blob_name)

            # Set cache control to one hour
            blob.cache_control = "public, max-age=3600"

            # Upload the file to the bucket
            blob.upload_from_filename(file_path)
            print(f"File {file_path} uploaded to {blob_name}.")
