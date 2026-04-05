import requests

BASE_URL = "http://localhost:8080"
LOGIN_URL = f"{BASE_URL}/api/login"
LOGOUT_URL = f"{BASE_URL}/api/logout"
AUTH_URL = f"{BASE_URL}/api/auth"

ADMIN_EMAIL = "windcast@naver.com"
ADMIN_PASSWORD = "tower147@@"
TIMEOUT = 30

def test_post_logout_api_should_invalidate_admin_session():
    session = requests.Session()
    try:
        # Step 1: Login with valid admin credentials
        login_payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        login_response = session.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"

        # Step 2: Verify that /api/auth returns authenticated True before logout
        auth_response_before = session.get(AUTH_URL, timeout=TIMEOUT)
        assert auth_response_before.status_code == 200, f"Auth check failed with status code {auth_response_before.status_code}"
        auth_data_before = auth_response_before.json()
        assert "authenticated" in auth_data_before, "authenticated field missing in auth before logout"
        assert auth_data_before["authenticated"] is True, "User should be authenticated before logout"

        # Step 3: Logout using POST /api/logout
        logout_response = session.post(LOGOUT_URL, timeout=TIMEOUT)
        assert logout_response.status_code == 200, f"Logout failed with status code {logout_response.status_code}"

        # Step 4: Verify that /api/auth returns authenticated False (or falsy) after logout
        auth_response_after = session.get(AUTH_URL, timeout=TIMEOUT)
        assert auth_response_after.status_code == 200, f"Auth check failed with status code {auth_response_after.status_code}"
        auth_data_after = auth_response_after.json()
        # 'authenticated' field might be False or None after logout
        assert "authenticated" in auth_data_after, "authenticated field missing in auth after logout"
        assert auth_data_after["authenticated"] is False or auth_data_after["authenticated"] is None, "User should not be authenticated after logout"

    finally:
        session.close()


test_post_logout_api_should_invalidate_admin_session()
