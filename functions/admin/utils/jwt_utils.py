import flask
from firebase_admin import auth

def verify_id_token_and_email(allowed_emails):
    print(f"verifiying id token and email")
    id_token = flask.request.headers.get("Authorization")
    print(f"id_token: {id_token}")
    if not id_token:
        print("Missing Authorization header")
        raise Exception("Missing Authorization header")

    if id_token.startswith("Bearer "):
        print("Bearer token found")
        id_token = id_token.split("Bearer ")[1]

    try:
        print(f"verifying id token")
        decoded_token = auth.verify_id_token(id_token)
        print(f"decoded token: {decoded_token}")
        email = decoded_token.get("email")
        print(f"email: {email}")
        if email not in allowed_emails:
            print("Unauthorized Email")
            raise Exception("Unauthorized Email")
        return decoded_token, None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None, str(e)
