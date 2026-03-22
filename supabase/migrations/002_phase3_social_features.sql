-- ============================================================
-- Migration: 002_phase3_social_features
-- Description: Friends, Lists, Recommendations, Taste Profiles
-- Created: 2026-03-21
-- ============================================================

-- ============================================================
-- GENRES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_genres_tmdb_id ON genres(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Genres are viewable by everyone" ON genres
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage genres" ON genres
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- CONTENT_GENRES JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS content_genres (
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, genre_id)
);

CREATE INDEX IF NOT EXISTS idx_content_genres_content ON content_genres(content_id);
CREATE INDEX IF NOT EXISTS idx_content_genres_genre ON content_genres(genre_id);

ALTER TABLE content_genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content genres are viewable by everyone" ON content_genres
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage content genres" ON content_genres
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FRIEND REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_id, receiver_id),
    CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their incoming requests
CREATE POLICY "Users can view incoming friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = receiver_id);

-- Users can view their outgoing requests
CREATE POLICY "Users can view outgoing friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = sender_id);

-- Users can send friend requests to others
CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update (accept/reject) requests sent to them
CREATE POLICY "Users can update received friend requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Users can delete (cancel) their own outgoing requests
CREATE POLICY "Users can delete their own friend requests" ON friend_requests
    FOR DELETE USING (auth.uid() = sender_id);

-- ============================================================
-- FRIENDSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view their friendships
CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Insert handled by trigger from friend_requests
CREATE POLICY "Service can manage friendships" ON friendships
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FUNCTION: Accept friend request and create bidirectional friendships
-- ============================================================
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS UUID AS $$
DECLARE
    v_sender_id UUID;
    v_receiver_id UUID;
    v_friendship_id UUID;
BEGIN
    -- Get the request details
    SELECT sender_id, receiver_id INTO v_sender_id, v_receiver_id
    FROM friend_requests
    WHERE id = request_id AND status = 'pending' AND receiver_id = auth.uid();

    IF v_sender_id IS NULL THEN
        RAISE EXCEPTION 'Friend request not found or already processed';
    END IF;

    -- Update request status
    UPDATE friend_requests SET status = 'accepted', updated_at = now()
    WHERE id = request_id;

    -- Create friendship (user -> friend)
    INSERT INTO friendships (user_id, friend_id)
    VALUES (v_receiver_id, v_sender_id)
    ON CONFLICT (user_id, friend_id) DO NOTHING
    RETURNING id INTO v_friendship_id;

    -- Create reverse friendship (friend -> user)
    INSERT INTO friendships (user_id, friend_id)
    VALUES (v_sender_id, v_receiver_id)
    ON CONFLICT (user_id, friend_id) DO NOTHING;

    RETURN v_friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION accept_friend_request TO authenticated;

-- ============================================================
-- USER LISTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'friends', 'private')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_visibility ON user_lists(visibility);

ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;

-- Users can view their own lists
CREATE POLICY "Users can view their own lists" ON user_lists
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create lists
CREATE POLICY "Users can create lists" ON user_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update their own lists" ON user_lists
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete their own lists" ON user_lists
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- LIST ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(list_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_content_id ON list_items(content_id);
CREATE INDEX IF NOT EXISTS idx_list_items_position ON list_items(list_id, position);

ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Users can view items in their lists
CREATE POLICY "Users can view items in their own lists" ON list_items
    FOR SELECT USING (
        list_id IN (SELECT id FROM user_lists WHERE user_id = auth.uid())
    );

-- Users can add items to their own lists
CREATE POLICY "Users can add items to their own lists" ON list_items
    FOR INSERT WITH CHECK (
        list_id IN (SELECT id FROM user_lists WHERE user_id = auth.uid())
    );

-- Users can remove items from their own lists
CREATE POLICY "Users can remove items from their own lists" ON list_items
    FOR DELETE USING (
        list_id IN (SELECT id FROM user_lists WHERE user_id = auth.uid())
    );

-- ============================================================
-- TASTE PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS taste_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    genre_scores JSONB DEFAULT '{}',
    content_type_preference TEXT DEFAULT 'both',
    language_preferences TEXT[] DEFAULT '{}',
    top_genres TEXT[] DEFAULT '{}',
    watch_history_summary JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_taste_profiles_user_id ON taste_profiles(user_id);

ALTER TABLE taste_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own taste profile
CREATE POLICY "Users can view their own taste profile" ON taste_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own taste profile
CREATE POLICY "Users can insert their own taste profile" ON taste_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own taste profile
CREATE POLICY "Users can update their own taste profile" ON taste_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RECOMMENDATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (match_score >= 0 AND match_score <= 1),
    reason TEXT,
    source TEXT DEFAULT 'taste_profile' CHECK (source IN ('taste_profile', 'friends', 'trending', 'similar')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'watched')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id, source)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_content_id ON recommendations(content_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(user_id, match_score DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view their own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert recommendations (via service/API)
CREATE POLICY "Service can create recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Users can update their own recommendations
CREATE POLICY "Users can update their own recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete their own recommendations" ON recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- USER PREFERENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_content_types TEXT[] DEFAULT ARRAY['movie', 'series'],
    preferred_languages TEXT[] DEFAULT '{}',
    exclude_watched BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Generate taste profile from watch history
-- ============================================================
CREATE OR REPLACE FUNCTION generate_taste_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_genre_scores JSONB := '{}';
    v_content_type_pref TEXT;
    v_language_prefs TEXT[] := '{}';
    v_top_genres TEXT[] := '{}';
    v_watch_summary JSONB;
BEGIN
    -- Calculate genre scores from watch history (via content join)
    SELECT jsonb_object_agg(genre, score)
    INTO v_genre_scores
    FROM (
        SELECT 
            gc.name as genre,
            COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM watch_history WHERE user_id = p_user_id), 0) as score
        FROM watch_history wh
        JOIN content c ON wh.content_id = c.id
        JOIN content_genres cg ON c.id = cg.content_id
        JOIN genres g ON cg.genre_id = g.id
        WHERE wh.user_id = p_user_id
        GROUP BY g.name
    ) genre_scores;

    -- Determine content type preference
    SELECT CASE 
        WHEN movie_count > series_count THEN 'movie'
        WHEN series_count > movie_count THEN 'series'
        ELSE 'both'
    END
    INTO v_content_type_pref
    FROM (
        SELECT 
            COUNT(*) FILTER (WHERE wh.content_type = 'movie') as movie_count,
            COUNT(*) FILTER (WHERE wh.content_type = 'series') as series_count
        FROM watch_history wh
        WHERE wh.user_id = p_user_id
    ) counts;

    -- Get top genres (top 5)
    SELECT array_agg(genre ORDER BY score DESC) INTO v_top_genres
    FROM (
        SELECT key as genre, value as score
        FROM jsonb_each_text(v_genre_scores)
        ORDER BY score DESC
        LIMIT 5
    ) top;

    -- Create watch history summary
    SELECT jsonb_build_object(
        'total_watched', COUNT(*),
        'movies_watched', COUNT(*) FILTER (WHERE content_type = 'movie'),
        'series_watched', COUNT(*) FILTER (WHERE content_type = 'series'),
        'platform_breakdown', (
            SELECT jsonb_object_agg(platform, cnt)
            FROM (SELECT p.name as platform, COUNT(*) as cnt FROM watch_history wh JOIN platforms p ON wh.platform_id = p.id WHERE wh.user_id = p_user_id GROUP BY p.name) pb
        )
    ) INTO v_watch_summary
    FROM watch_history
    WHERE user_id = p_user_id;

    -- Upsert taste profile
    INSERT INTO taste_profiles (user_id, genre_scores, content_type_preference, top_genres, watch_history_summary, last_updated)
    VALUES (p_user_id, COALESCE(v_genre_scores, '{}'), COALESCE(v_content_type_pref, 'both'), COALESCE(v_top_genres, '{}'), COALESCE(v_watch_summary, '{}'), now())
    ON CONFLICT (user_id) DO UPDATE SET
        genre_scores = COALESCE(EXCLUDED.genre_scores, taste_profiles.genre_scores),
        content_type_preference = COALESCE(EXCLUDED.content_type_preference, taste_profiles.content_type_preference),
        top_genres = COALESCE(EXCLUDED.top_genres, taste_profiles.top_genres),
        watch_history_summary = COALESCE(EXCLUDED.watch_history_summary, taste_profiles.watch_history_summary),
        last_updated = now();

    -- Return the profile
    RETURN jsonb_build_object(
        'genre_scores', v_genre_scores,
        'content_type_preference', v_content_type_pref,
        'top_genres', v_top_genres,
        'watch_history_summary', v_watch_summary
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION generate_taste_profile TO authenticated, service_role;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT ALL ON friend_requests TO authenticated, anon, service_role;
GRANT ALL ON friendships TO authenticated, anon, service_role;
GRANT ALL ON user_lists TO authenticated, anon, service_role;
GRANT ALL ON list_items TO authenticated, anon, service_role;
GRANT ALL ON taste_profiles TO authenticated, anon, service_role;
GRANT ALL ON recommendations TO authenticated, anon, service_role;
GRANT ALL ON user_preferences TO authenticated, anon, service_role;

-- ============================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================
-- Run these to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
