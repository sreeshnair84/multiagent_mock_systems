from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator

# Use async SQLite driver
DATABASE_URL = "sqlite+aiosqlite:///./antigravity.db"

engine = create_async_engine(DATABASE_URL, echo=True, future=True)

async def init_db():
    from app.core.seed_data import seed_database
    
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # Uncomment to reset
        await conn.run_sync(SQLModel.metadata.create_all)
    
    # Seed database with mock data
    async with AsyncSession(engine) as session:
        await seed_database(session)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
