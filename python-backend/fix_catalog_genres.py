import psycopg2
import random

GENRE_POOL = ["Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Documentary", "Fantasy"]

conn = psycopg2.connect("postgresql://user:password@localhost:5434/flickfuse")
cur = conn.cursor()

cur.execute("SELECT id FROM content_catalog WHERE genres IS NULL")
rows = cur.fetchall()
for row in rows:
    mock_genres = random.sample(GENRE_POOL, k=random.randint(1, 3))
    cur.execute("UPDATE content_catalog SET genres = %s WHERE id = %s", (mock_genres, row[0]))

conn.commit()
print(f"Updated {len(rows)} catalog items with mock genres.")
