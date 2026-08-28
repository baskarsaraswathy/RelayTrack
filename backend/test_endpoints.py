import urllib.request
import json
import time

def test_endpoint(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            status = response.status
            data = json.loads(response.read().decode())
            return status == 200, data
    except Exception as e:
        return False, str(e)

base_url = "http://127.0.0.1:8010/api"

endpoints = [
    "/health",
    "/hubs",
    "/routes",
    "/packages",
    "/risk-alerts",
    "/incidents",
    "/rfid-events"
]

time.sleep(2) # wait for server to start

for ep in endpoints:
    url = base_url + ep
    success, result = test_endpoint(url)
    print(f"Testing {ep}: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"  Error/Data: {result}")

# Test individual package endpoint
# Find a tracking number from /packages first
success, packages = test_endpoint(base_url + "/packages")
if success and packages and isinstance(packages, list) and len(packages) > 0:
    tracking_number = packages[0].get("tracking_number")
    if tracking_number:
        success, pkg = test_endpoint(f"{base_url}/packages/{tracking_number}")
        print(f"Testing /packages/{{tracking_number}}: {'PASS' if success else 'FAIL'}")
        if not success:
             print(f"  Error/Data: {pkg}")
    else:
        print("Testing /packages/{tracking_number}: SKIP (No tracking_number found in packages)")
else:
    print("Testing /packages/{tracking_number}: SKIP (Failed to fetch packages or no packages)")
