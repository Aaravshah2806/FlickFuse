import requests

email = "test999@example.com"
res = requests.post("http://localhost:3000/api/auth/register", json={"email": email, "password": "password123", "username": "testuser999"})
data = res.json()
token = data.get("accessToken", "")
res2 = requests.get("http://localhost:3000/api/recommendations", headers={"Authorization": f"Bearer {token}"})
print("Recs status:", res2.status_code)
print("Recs response:", res2.text)
