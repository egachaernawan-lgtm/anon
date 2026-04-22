-- Add view_count to threads
ALTER TABLE threads ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- Atomic increment for view count
CREATE OR REPLACE FUNCTION increment_view_count(thread_id UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE threads SET view_count = view_count + 1 WHERE id = thread_id;
$$;
