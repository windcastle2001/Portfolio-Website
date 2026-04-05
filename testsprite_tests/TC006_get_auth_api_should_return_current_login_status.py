import requests

BASE_URL = "http://localhost:8080"
LOGIN_ENDPOINT = "/api/login"
LOGOUT_ENDPOINT = "/api/logout"
AUTH_ENDPOINT = "/api/auth"

ADMIN_CREDENTIALS = {
    "email": "windcast@naver.com",
    "password": "tower147@@"
}

def test_get_auth_api_should_return_current_login_status():
    session = requests.Session()
    try:
        # Login first to obtain auth session or token
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json={"email": ADMIN_CREDENTIALS["email"], "password": ADMIN_CREDENTIALS["password"]},
            timeout=30
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

        # Check auth status after login
        auth_resp = session.get(BASE_URL + AUTH_ENDPOINT, timeout=30)
        assert auth_resp.status_code == 200, f"Auth check failed after login: {auth_resp.text}"
        auth_json = auth_resp.json()
        assert isinstance(auth_json, dict), "Auth response is not a JSON object"

        # Check login status in auth response
        if "logged_in" in auth_json:
            logged_in_flag = auth_json["logged_in"]
        elif "is_authenticated" in auth_json:
            logged_in_flag = auth_json["is_authenticated"]
        elif "authenticated" in auth_json:
            logged_in_flag = auth_json["authenticated"]
        elif "status" in auth_json:
            logged_in_flag = auth_json["status"] == "logged_in"
        else:
            assert False, "Auth response missing login status indication"

        assert str(logged_in_flag).lower() == "true" or str(logged_in_flag) == "1", \
            f"Expected logged_in true after login, got {logged_in_flag}"

        # Logout to clear session
        logout_resp = session.post(BASE_URL + LOGOUT_ENDPOINT, timeout=30)
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"

        # Check auth status after logout
        auth_resp2 = session.get(BASE_URL + AUTH_ENDPOINT, timeout=30)
        assert auth_resp2.status_code == 200, f"Auth check failed after logout: {auth_resp2.text}"
        auth_json2 = auth_resp2.json()
        assert isinstance(auth_json2, dict), "Auth response after logout is not a JSON object"

        # Check logged out status
        if "logged_in" in auth_json2:
            logged_in_flag2 = auth_json2["logged_in"]
        elif "is_authenticated" in auth_json2:
            logged_in_flag2 = auth_json2["is_authenticated"]
        elif "authenticated" in auth_json2:
            logged_in_flag2 = auth_json2["authenticated"]
        elif "status" in auth_json2:
            logged_in_flag2 = auth_json2["status"] == "logged_out"
        else:
            assert False, "Auth response missing login status indication"

        assert str(logged_in_flag2).lower() == "false" or str(logged_in_flag2) == "0" or str(logged_in_flag2).lower() == "logged_out", \
            f"Expected logged_in false after logout, got {logged_in_flag2}"

    finally:
        session.close()

test_get_auth_api_should_return_current_login_status()
