-- Database Permissions Fix
-- Run this as the 'postgres' superuser (or the owner of the database/schema)

-- 1. Grant usage on schema public to the user 'storybook'
GRANT USAGE ON SCHEMA public TO storybook;

-- 2. Grant create privilege on schema public to 'storybook'
GRANT CREATE ON SCHEMA public TO storybook;

-- 3. (Optional) Make 'storybook' the owner of the public schema (Stronger permission)
-- ALTER SCHEMA public OWNER TO storybook;

-- 4. Grant privileges on all existing tables/sequences (if any exist but permission denied)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO storybook;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO storybook;
