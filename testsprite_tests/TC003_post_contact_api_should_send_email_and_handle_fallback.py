import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_post_contact_api_should_send_email_and_handle_fallback():
    url = f"{BASE_URL}/api/contact"
    payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a test message for validating contact form email sending."
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.exceptions.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    # The server tries SMTP sending; if SMTP_PASS not set, it falls back to EmailJS.
    # On success, expect HTTP 200 with success message (JSON).
    # On failure (e.g. SMTP error and no fallback) expect HTTP 503 or appropriate error with fallback notice.
    assert response.status_code in (200, 503), f"Unexpected status code {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON."

    if response.status_code == 200:
        # Expect a success message indicating message was sent
        assert "success" in data or "message" in data, "Response JSON missing success/message keys"
        # Accept if success true or a success message string is present
        if isinstance(data.get("success"), bool):
            assert data["success"] is True, f"Expected success true but got {data.get('success')}"
        if "message" in data:
            assert isinstance(data["message"], str) and len(data["message"]) > 0, \
                "Response message should be a non-empty string"
    else:
        # 503 Service Unavailable indicates SMTP failure fallback triggered?
        # Should include error or fallback indication in message
        assert ("error" in data or "message" in data), "Error response missing error or message field"
        message = data.get("message", "").lower()
        error = data.get("error", "").lower()
        fallback_indicators = ["fallback", "emailjs", "smtp", "unavailable"]
        combined_text = message + error
        assert any(term in combined_text for term in fallback_indicators), \
            "No indication of SMTP failure fallback in error message"

test_post_contact_api_should_send_email_and_handle_fallback()