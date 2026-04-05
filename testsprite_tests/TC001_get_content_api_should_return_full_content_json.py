import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_get_content_api_should_return_full_content_json():
    url = f"{BASE_URL}/api/content"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET /api/content request failed: {str(e)}"

    assert response.headers.get("Content-Type") is not None and "application/json" in response.headers.get("Content-Type"), "Response Content-Type is not application/json"
    try:
        content_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check that all expected top-level sections are present with lowercase keys
    expected_sections = [
        "hero", "about", "capabilities", "story", "projects", "metrics", "skills", "contact"
    ]
    missing_sections = [section for section in expected_sections if section not in content_json]
    assert not missing_sections, f"Missing expected sections in content.json: {missing_sections}"

test_get_content_api_should_return_full_content_json()