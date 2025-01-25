import argparse
from sync import sync
from export_orders import export_orders
from upload_images import upload_images
from backup import backup

def main():
    parser = argparse.ArgumentParser(description="Run various commands.")
    parser.add_argument("command", choices=["sync", "export", "upload_images"], help="The command to run")

    args = parser.parse_args()

    if args.command == "sync":
        sync()
    elif args.command == "export":
        export_orders()
    elif args.command == "upload_images":
        upload_images()
    elif args.command == "backup":
        backup()

if __name__ == "__main__":
    main()