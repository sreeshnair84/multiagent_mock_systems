import asyncio
import sys
import os

# Set path
sys.path.append(os.getcwd())

from app.core.database import engine
from app.core.seed_data import seed_database
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

async def main():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
    print("Seeding...")
    async with AsyncSession(engine) as session:
        try:
            await seed_database(session)
            print("Seeding COMPLETE.")
        except Exception as e:
            print(f"Seeding FAILED: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
