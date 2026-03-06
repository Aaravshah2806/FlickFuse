import requests
import json

res = requests.post("http://localhost:3000/api/auth/login", json={"email": "test@example.com", "password": "password123"})
print("Login status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    token = data["accessToken"]
    res2 = requests.get("http://localhost:3000/api/users/me", headers={"Authorization": f"Bearer {token}"})
    print("Me status:", res2.status_code)
    print("Me response:", res2.json())
