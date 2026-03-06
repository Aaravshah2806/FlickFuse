import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    
    print("Executing schema generation...")
    await conn.execute("""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            unique_id VARCHAR(50) UNIQUE NOT NULL,
            display_name VARCHAR(100),
            password_hash VARCHAR(255),
            profile_picture_url VARCHAR(500),
            bio TEXT,
            privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "taste_profile_sharing": "all_friends", "activity_visibility": true, "recommendation_sharing": true}'::jsonb,
            email_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS friendships (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            accepted_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(user_id, friend_id)
        );

        CREATE TABLE IF NOT EXISTS taste_profiles (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            genre_vector JSONB,
            language_preferences JSONB,
            viewing_patterns JSONB,
            recent_favorites JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_lists (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            visibility VARCHAR(20) DEFAULT 'friends',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS content_catalog (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(255) NOT NULL,
            content_type VARCHAR(50),
            synopsis TEXT,
            release_date DATE,
            genres TEXT[],
            languages TEXT[],
            poster_path VARCHAR(500),
            tmdb_id VARCHAR(100),
            ratings JSONB,
            platform_availability TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(title)
        );

        CREATE TABLE IF NOT EXISTS user_list_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
            catalog_id UUID REFERENCES content_catalog(id) ON DELETE CASCADE,
            position INT,
            notes TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(list_id, catalog_id)
        );

        CREATE TABLE IF NOT EXISTS watch_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            catalog_id UUID REFERENCES content_catalog(id) ON DELETE CASCADE,
            platform VARCHAR(50),
            title VARCHAR(255),
            date_watched TIMESTAMP WITH TIME ZONE,
            progress_percent INT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, catalog_id)
        );

        CREATE TABLE IF NOT EXISTS recommendations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            catalog_id UUID REFERENCES content_catalog(id) ON DELETE CASCADE,
            match_score INT,
            reason TEXT,
            user_feedback VARCHAR(50),
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            feedback_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(user_id, catalog_id)
        );
    """)

    # Function to auto-generate unique id like ABC-12345
    await conn.execute("""
        CREATE OR REPLACE FUNCTION generate_unique_id()
        RETURNS TRIGGER AS $$
        DECLARE
            chars text[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
            nums text[] := '{0,1,2,3,4,5,6,7,8,9}';
            result text := '';
            i integer;
        BEGIN
            IF NEW.unique_id IS NULL THEN
                FOR i IN 1..3 LOOP
                    result := result || chars[1+random()*(array_length(chars, 1)-1)];
                END LOOP;
                result := result || '-';
                FOR i IN 1..5 LOOP
                    result := result || nums[1+random()*(array_length(nums, 1)-1)];
                END LOOP;
                NEW.unique_id := result;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_generate_unique_id ON users;
        CREATE TRIGGER trigger_generate_unique_id
        BEFORE INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION generate_unique_id();
    """)

    print("Schema initialized successfully.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(init_db())
