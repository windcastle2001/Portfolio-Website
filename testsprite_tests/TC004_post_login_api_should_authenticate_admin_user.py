import requests

BASE_URL = "http://localhost:8080"
LOGIN_ENDPOINT = f"{BASE_URL}/api/login"
LOGOUT_ENDPOINT = f"{BASE_URL}/api/logout"
AUTH_ENDPOINT = f"{BASE_URL}/api/auth"
CONTENT_ENDPOINT = f"{BASE_URL}/api/content"

VALID_ADMIN_CREDENTIALS = {
    "email": "windcast@naver.com",
    "password": "tower147@@"
}

INVALID_ADMIN_CREDENTIALS = {
    "email": "windcast@naver.com",
    "password": "wrongpassword"
}

HEADERS = {
    "Content-Type": "application/json"
}

def post_login_api_should_authenticate_admin_user():
    session = requests.Session()
    try:
        # Test valid credentials login
        resp_valid = session.post(
            LOGIN_ENDPOINT,
            json=VALID_ADMIN_CREDENTIALS,
            headers=HEADERS,
            timeout=30
        )
        assert resp_valid.status_code == 200, f"Expected 200 OK, got {resp_valid.status_code}"
        json_valid = resp_valid.json()
        # Should contain a message or token or session for successful login
        assert isinstance(json_valid, dict), "Login response is not a JSON object"

        # Test invalid credentials login (new session)
        session_invalid = requests.Session()
        resp_invalid = session_invalid.post(
            LOGIN_ENDPOINT,
            json=INVALID_ADMIN_CREDENTIALS,
            headers=HEADERS,
            timeout=30
        )
        # Expected: auth error, likely 401 or 400
        assert resp_invalid.status_code in (400, 401), f"Expected 400 or 401 for invalid login, got {resp_invalid.status_code}"
        json_invalid = resp_invalid.json()
        # Should contain error message about authentication
        assert isinstance(json_invalid, dict), "Invalid login response is not a JSON object"

    finally:
        # Logout to cleanup if logged in
        try:
            session.post(LOGOUT_ENDPOINT, headers=HEADERS, timeout=30)
        except Exception:
            pass

post_login_api_should_authenticate_admin_user()
