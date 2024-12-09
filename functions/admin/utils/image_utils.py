import os
from PIL import Image


def downscale_images(input_path, output_path, mobile_size=(720, 1280)):
    for root, _, files in os.walk(input_path):
        for file in files:
            if file.lower().endswith(("png", "jpg", "jpeg", "gif", "bmp")):
                file_path = os.path.join(root, file)
                with Image.open(file_path) as img:
                    relative_path = os.path.relpath(root, input_path)

                    # Downscale for mobile
                    img_mobile = img.copy()
                    img_mobile.thumbnail(mobile_size, Image.Resampling.LANCZOS)
                    mobile_output_dir = os.path.join(output_path, relative_path)
                    os.makedirs(mobile_output_dir, exist_ok=True)
                    mobile_output_path = os.path.join(
                        mobile_output_dir, f"mobile_{file}"
                    )
                    img_mobile.save(mobile_output_path, optimize=True, quality=85)
