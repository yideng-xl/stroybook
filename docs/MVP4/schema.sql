-- Database Schema for Storybook Application
-- Run this script in your PostgreSQL database (storybook) if tables are missing.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

-- 2. Stories Table
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    title_zh VARCHAR(255),
    title_en VARCHAR(255),
    user_id VARCHAR(255),
    status VARCHAR(50),
    generation_prompt VARCHAR(1000),
    selected_style_id VARCHAR(255),
    error_message VARCHAR(2000),
    description VARCHAR(2000),
    custom_voice_id BIGINT,
    audio_status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. Story Pages Table
CREATE TABLE IF NOT EXISTS story_pages (
    id BIGSERIAL PRIMARY KEY,
    story_id VARCHAR(255) NOT NULL,
    page_number INTEGER,
    text_zh VARCHAR(2000),
    text_en VARCHAR(2000),
    image_url VARCHAR(255),
    audio_url_zh VARCHAR(255),
    audio_url_en VARCHAR(255),
    custom_audio_url_zh VARCHAR(255),
    custom_audio_url_en VARCHAR(255),
    CONSTRAINT fk_story_pages_story FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 4. Story Styles Table
CREATE TABLE IF NOT EXISTS story_styles (
    id BIGSERIAL PRIMARY KEY,
    story_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    cover_image VARCHAR(255),
    CONSTRAINT fk_story_styles_story FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- 5. User Voices Table
CREATE TABLE IF NOT EXISTS user_voices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

-- 6. Reading Progress Table
CREATE TABLE IF NOT EXISTS reading_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    story_id VARCHAR(255) NOT NULL,
    style_name VARCHAR(255),
    current_page INTEGER NOT NULL,
    duration_seconds BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP,
    CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Guest Reading Logs Table
CREATE TABLE IF NOT EXISTS guest_reading_logs (
    id BIGSERIAL PRIMARY KEY,
    guest_id VARCHAR(255) NOT NULL,
    story_id VARCHAR(255) NOT NULL,
    read_at TIMESTAMP
);
