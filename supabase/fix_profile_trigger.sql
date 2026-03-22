-- Fix the profiles table - remove the foreign key constraint
-- and use a simpler approach

-- 1. Drop the existing profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Create profiles table WITHOUT foreign key constraint
-- We'll match the ID format but not enforce the FK
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    unique_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    privacy_setting privacy_setting DEFAULT 'friends',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create the ID generation function
CREATE OR REPLACE FUNCTION generate_unique_id() RETURNS TEXT AS $$
DECLARE letters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
BEGIN
    RETURN SUBSTRING(letters FROM floor(1 + random() * 26)::int FOR 1) ||
           SUBSTRING(letters FROM floor(1 + random() * 26)::int FOR 1) ||
           SUBSTRING(letters FROM floor(1 + random() * 26)::int FOR 1) ||
           '-' || LPAD(floor(random() * 100000)::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger function
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, unique_id) VALUES (NEW.id, generate_unique_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create policies
CREATE POLICY "users_insert_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_view_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 9. Grant permissions
GRANT ALL ON profiles TO authenticated, anon, service_role;
