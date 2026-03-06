import requests
import random

email = f"testrec{random.randint(1,10000)}@example.com"
res = requests.post("http://localhost:3000/api/auth/register", json={"email": email, "password": "password123", "username": f"recuser{random.randint(1,10000)}"})
token = res.json().get("accessToken", "")
print("Register:", res.status_code)

headers = {"Authorization": f"Bearer {token}"}

# Attempt generation without watch history
res2 = requests.post("http://localhost:3000/api/recommendations/generate", headers=headers)
print("Generate w/o history:", res2.status_code, res2.text)

# We need to insert some catalog and watch history to test successful generation
import psycopg2
import os

conn = psycopg2.connect("postgresql://user:password@localhost:5434/flickfuse")
cur = conn.cursor()
cur.execute("SELECT id FROM users WHERE email = %s", (email,))
user_id = cur.fetchone()[0]

cur.execute("INSERT INTO content_catalog (title, genres) VALUES ('Test Movie', ARRAY['Action', 'Sci-Fi']) RETURNING id")
catalog_id = cur.fetchone()[0]

cur.execute("INSERT INTO watch_events (user_id, catalog_id, platform) VALUES (%s, %s, 'Netflix')", (user_id, catalog_id))
conn.commit()

# Now test generation
res3 = requests.post("http://localhost:3000/api/recommendations/generate", headers=headers)
print("Generate WITH history:", res3.status_code, res3.text)

