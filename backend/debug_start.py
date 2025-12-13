import asyncio
from app.core.database import init_db
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

try:
    print("Testing imports...")
    from main import app
    print("Imports successful.")
    
    async def test_manual_checkpointer():
        import aiosqlite
        from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
        print("Testing Manual Checkpointer...")
        async with aiosqlite.connect("checkpoints.db") as conn:
            checkpointer = AsyncSqliteSaver(conn)
            print("Manual Checkpointer initialized.")
            # Verify setup
            await checkpointer.setup()
            print("Setup complete.")
    
    asyncio.run(test_manual_checkpointer())
    print("Manual Checkpointer verified.")

except Exception as e:
    import traceback
    traceback.print_exc()
