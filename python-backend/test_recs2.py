import requests
import random

email = f"test{random.randint(2000,9000)}@example.com"
res = requests.post("http://localhost:3000/api/auth/register", json={"email": email, "password": "password123", "username": f"testuser{random.randint(2000,9000)}"})
data = res.json()
token = data.get("accessToken", "")
print("Register:", res.status_code, token[:10])
res2 = requests.get("http://localhost:3000/api/recommendations", headers={"Authorization": f"Bearer {token}"})
print("Recs status:", res2.status_code)
print("Recs response:", res2.text)
