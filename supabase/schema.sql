-- ============================================================
-- Schema: StreamSync Phase 4 - Watch History & Content Import
-- Description: Tables for platforms, content mapping, and watch history
-- ============================================================

-- Create enum for content type if not exists
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('movie', 'series');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- PLATFORMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default platforms
INSERT INTO platforms (name, display_name, logo_url) VALUES
    ('netflix', 'Netflix', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'),
    ('prime', 'Prime Video', 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg'),
    ('hotstar', 'Hotstar', 'https://img.hotstar.com/assets/guest/v3/ic_hotstar.svg')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Platforms are viewable by everyone" ON platforms
    FOR SELECT USING (true);

-- Only service role can modify
CREATE POLICY "Service role can manage platforms" ON platforms
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- CONTENT TABLE (TMDB-mapped content)
-- ============================================================
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_type content_type NOT NULL,
    description TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    release_year INTEGER,
    tmdb_id INTEGER UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_tmdb_id ON content(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_content_title ON content(title);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Content is viewable by everyone" ON content
    FOR SELECT USING (true);

-- Authenticated users can insert content (for imports)
CREATE POLICY "Authenticated users can insert content" ON content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Service role can modify
CREATE POLICY "Service role can modify content" ON content
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- WATCH HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform_id UUID REFERENCES platforms(id),
    content_id UUID REFERENCES content(id),
    content_title TEXT NOT NULL,
    content_type content_type NOT NULL,
    watched_date DATE NOT NULL,
    season_number INTEGER,
    episode_number INTEGER,
    episode_title TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_date ON watch_history(watched_date DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_content_id ON watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_platform_id ON watch_history(platform_id);

-- Composite index for user + date queries
CREATE INDEX IF NOT EXISTS idx_watch_history_user_date ON watch_history(user_id, watched_date DESC);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own watch history
CREATE POLICY "Users can view their own watch history" ON watch_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own watch history
CREATE POLICY "Users can insert their own watch history" ON watch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own watch history
CREATE POLICY "Users can delete their own watch history" ON watch_history
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON platforms TO authenticated, anon, service_role;
GRANT ALL ON content TO authenticated, anon, service_role;
GRANT ALL ON watch_history TO authenticated, anon, service_role;

-- ============================================================
-- FUNCTION: Get or create content by TMDB ID
-- ============================================================
CREATE OR REPLACE FUNCTION get_or_create_content(
    p_title TEXT,
    p_content_type content_type,
    p_tmdb_id INTEGER,
    p_poster_url TEXT DEFAULT NULL,
    p_backdrop_url TEXT DEFAULT NULL,
    p_release_year INTEGER DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_content_id UUID;
BEGIN
    -- Try to find existing content by tmdb_id
    SELECT id INTO v_content_id FROM content WHERE tmdb_id = p_tmdb_id;
    
    IF v_content_id IS NOT NULL THEN
        RETURN v_content_id;
    END IF;
    
    -- Insert new content
    INSERT INTO content (title, content_type, tmdb_id, poster_url, backdrop_url, release_year, description)
    VALUES (p_title, p_content_type, p_tmdb_id, p_poster_url, p_backdrop_url, p_release_year, p_description)
    RETURNING id INTO v_content_id;
    
    RETURN v_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_or_create_content TO authenticated, service_role;

-- ============================================================
-- FUNCTION: Add watch history entry with auto content creation
-- ============================================================
CREATE OR REPLACE FUNCTION add_watch_history_entry(
    p_user_id UUID,
    p_platform_id UUID,
    p_content_title TEXT,
    p_content_type content_type,
    p_watched_date DATE,
    p_tmdb_id INTEGER DEFAULT NULL,
    p_poster_url TEXT DEFAULT NULL,
    p_season_number INTEGER DEFAULT NULL,
    p_episode_number INTEGER DEFAULT NULL,
    p_episode_title TEXT DEFAULT NULL,
    p_release_year INTEGER DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_content_id UUID;
    v_watch_id UUID;
BEGIN
    -- Get or create content
    IF p_tmdb_id IS NOT NULL THEN
        v_content_id := get_or_create_content(
            p_content_title,
            p_content_type,
            p_tmdb_id,
            p_poster_url,
            NULL,
            p_release_year,
            p_description
        );
    ELSE
        v_content_id := NULL;
    END IF;
    
    -- Insert watch history entry
    INSERT INTO watch_history (
        user_id, platform_id, content_id, content_title, content_type,
        watched_date, season_number, episode_number, episode_title
    )
    VALUES (
        p_user_id, p_platform_id, v_content_id, p_content_title, p_content_type,
        p_watched_date, p_season_number, p_episode_number, p_episode_title
    )
    RETURNING id INTO v_watch_id;
    
    RETURN v_watch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_watch_history_entry TO authenticated, service_role;
