import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def _init_connection(conn):
    await conn.set_type_codec(
        'uuid',
        encoder=str,
        decoder=str,
        schema='pg_catalog',
        format='text'
    )

async def main():
    try:
        pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            init=_init_connection
        )
        async with pool.acquire() as conn:
            # Create a UUID column temp table
            await conn.execute("CREATE TEMP TABLE IF NOT EXISTS test_uuid (id UUID, val TEXT)")
            # Insert string uuid
            test_id = '123e4567-e89b-12d3-a456-426614174000'
            await conn.execute("INSERT INTO test_uuid (id, val) VALUES ($1, $2)", test_id, "hello")
            
            # Fetch string uuid
            row = await conn.fetchrow("SELECT id, val FROM test_uuid WHERE id = $1", test_id)
            print("SUCCESS! row['id'] =", repr(row['id']))
        await pool.close()
    except Exception as e:
        print("ERROR:", type(e).__name__, e)

if __name__ == "__main__":
    asyncio.run(main())
