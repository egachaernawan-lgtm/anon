-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Anonymous users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '💬'
);

-- Subcategories
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Threads
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  author_uuid UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_token_hash TEXT NOT NULL,
  mask_id TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'removed')),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_ai_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (max 2 levels deep enforced in app logic)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_uuid UUID REFERENCES users(id) ON DELETE SET NULL,
  mask_id TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT FALSE,
  is_ai_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread reactions (one vote per user per thread)
CREATE TABLE thread_reactions (
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_uuid UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('up', 'down')),
  PRIMARY KEY (thread_id, user_uuid)
);

-- Comment reactions
CREATE TABLE comment_reactions (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_uuid UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('up', 'down')),
  PRIMARY KEY (comment_id, user_uuid)
);

-- Home feed cache (updated by cron)
CREATE TABLE home_feed_cache (
  subcategory_id INT REFERENCES subcategories(id) ON DELETE CASCADE PRIMARY KEY,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index on threads
CREATE INDEX threads_fts_idx ON threads USING GIN (
  to_tsvector('indonesian', title || ' ' || content)
);

-- Realtime: enable publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE threads;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE thread_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_reactions;

-- Seed categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Olahraga', 'olahraga', '⚽'),
  ('Hiburan', 'hiburan', '🎬'),
  ('Kehidupan', 'kehidupan', '💬'),
  ('Pendidikan', 'pendidikan', '📚'),
  ('Teknologi', 'teknologi', '💻'),
  ('Lainnya', 'lainnya', '🌀');

-- Seed subcategories
INSERT INTO subcategories (category_id, name, slug) VALUES
  (1, 'Sepak Bola', 'sepak-bola'),
  (1, 'Basket', 'basket'),
  (1, 'Badminton', 'badminton'),
  (1, 'Olahraga Lain', 'olahraga-lain'),
  (2, 'Film & Series', 'film-series'),
  (2, 'Musik', 'musik'),
  (2, 'Gaming', 'gaming'),
  (2, 'K-Pop', 'kpop'),
  (2, 'Anime', 'anime'),
  (3, 'Hubungan', 'hubungan'),
  (3, 'Keluarga', 'keluarga'),
  (3, 'Kesehatan Mental', 'kesehatan-mental'),
  (3, 'Curhat', 'curhat'),
  (4, 'Kuliah', 'kuliah'),
  (4, 'Karir', 'karir'),
  (4, 'Beasiswa', 'beasiswa'),
  (5, 'Gadget', 'gadget'),
  (5, 'Coding', 'coding'),
  (5, 'Startup', 'startup'),
  (6, 'Random', 'random'),
  (6, 'Pertanyaan Aneh', 'pertanyaan-aneh'),
  (6, 'Dewasa 18+', 'dewasa');
