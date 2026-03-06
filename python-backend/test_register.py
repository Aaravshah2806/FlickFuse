import requests
import json
import random

email = f"test{random.randint(1,1000)}@example.com"
res = requests.post("http://localhost:3000/api/auth/register", json={"email": email, "password": "password123", "username": f"testuser{random.randint(1,1000)}"})
print("Register status:", res.status_code)
if res.status_code == 201:
    data = res.json()
    token = data["accessToken"]
    res2 = requests.get("http://localhost:3000/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    print("Me status:", res2.status_code)
    print("Me response:", res2.json())
