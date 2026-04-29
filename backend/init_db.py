import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL found")
    exit(1)

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    with open("neon_schema.sql", "r") as f:
        schema = f.read()
    cur.execute(schema)
    conn.commit()
    print("Schema initialized successfully!")
    
    # Check tables
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    tables = cur.fetchall()
    print("Tables in DB:", [t[0] for t in tables])
    
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
