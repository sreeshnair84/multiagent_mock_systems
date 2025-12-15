
import asyncio
import logging
from sqlalchemy import text
from app.core.database import engine
from app.models import User

# Suppress SQLAlchemy logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

async def list_users():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT id, email, role, password_hash FROM user"))
            users = result.fetchall()
            print(f"\n--- DATA START ---")
            print(f"Found {len(users)} users:")
            for u in users:
                print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Hash: {u.password_hash[:10]}...")
            print(f"--- DATA END ---\n")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_users())
