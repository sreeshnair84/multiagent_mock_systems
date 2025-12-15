
import asyncio
import bcrypt
from sqlalchemy import text
from app.core.database import engine

async def check_password():
    email = "admin@company.com"
    password = "password123"
    
    async with engine.connect() as conn:
        result = await conn.execute(text(f"SELECT password_hash FROM user WHERE email = '{email}'"))
        row = result.first()
        
        if not row:
            print(f"User {email} NOT FOUND in DB!")
            return
            
        stored_hash = row[0]
        print(f"Stored Hash for {email}: {stored_hash}")
        
        if not stored_hash:
            print("Hash is empty!")
            return

        # Check password
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
            print(f"Password '{password}' matches? {is_valid}")
        except Exception as e:
            print(f"Error checking password: {e}")

if __name__ == "__main__":
    asyncio.run(check_password())
