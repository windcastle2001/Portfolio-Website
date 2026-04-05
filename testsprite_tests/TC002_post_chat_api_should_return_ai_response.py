import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 30

def test_post_chat_api_should_return_ai_response():
    url = f"{BASE_URL}/api/chat"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "message": "Can you tell me about the key projects in the portfolio?"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"

    # Check that the response contains a string AI-generated text (either actual or default message)
    # The exact field format is not given but we expect some text response.
    # Assuming the response JSON contains a key 'response' or similar.
    # Since not specified, we check for any string value in the JSON.

    assert isinstance(data, dict), "Response JSON is not a dictionary"
    # The AI response could be under a key like 'response', 'answer', 'message', or similar.
    # We'll check common keys that might contain the AI response
    possible_keys = ['response', 'answer', 'message', 'reply', 'text']
    ai_response = None
    for key in possible_keys:
        if key in data and isinstance(data[key], str) and data[key].strip():
            ai_response = data[key].strip()
            break

    assert ai_response is not None, "AI response not found or empty in response JSON"

    # Additional sanity check: the response should contain at least some expected keywords about portfolio
    # or be the default message when API key missing.
    # We won't enforce keywords strictly because default message can be different.
    assert len(ai_response) > 10, "AI response is unexpectedly short"

test_post_chat_api_should_return_ai_response()