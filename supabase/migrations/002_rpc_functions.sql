-- RPC functions for atomic counter updates

CREATE OR REPLACE FUNCTION increment_thread_reaction(thread_id UUID, col_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF col_name = 'upvotes' THEN
    UPDATE threads SET upvotes = upvotes + 1 WHERE id = thread_id;
  ELSIF col_name = 'downvotes' THEN
    UPDATE threads SET downvotes = downvotes + 1 WHERE id = thread_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_thread_reaction(thread_id UUID, col_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF col_name = 'upvotes' THEN
    UPDATE threads SET upvotes = GREATEST(0, upvotes - 1) WHERE id = thread_id;
  ELSIF col_name = 'downvotes' THEN
    UPDATE threads SET downvotes = GREATEST(0, downvotes - 1) WHERE id = thread_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION switch_thread_reaction(thread_id UUID, add_col TEXT, sub_col TEXT)
RETURNS VOID AS $$
BEGIN
  IF add_col = 'upvotes' THEN
    UPDATE threads SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = thread_id;
  ELSE
    UPDATE threads SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = thread_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_reaction(comment_id UUID, col_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF col_name = 'upvotes' THEN
    UPDATE comments SET upvotes = upvotes + 1 WHERE id = comment_id;
  ELSIF col_name = 'downvotes' THEN
    UPDATE comments SET downvotes = downvotes + 1 WHERE id = comment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_reaction(comment_id UUID, col_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF col_name = 'upvotes' THEN
    UPDATE comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = comment_id;
  ELSIF col_name = 'downvotes' THEN
    UPDATE comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = comment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION switch_comment_reaction(comment_id UUID, add_col TEXT, sub_col TEXT)
RETURNS VOID AS $$
BEGIN
  IF add_col = 'upvotes' THEN
    UPDATE comments SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = comment_id;
  ELSE
    UPDATE comments SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = comment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_count(thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE threads SET comment_count = comment_count + 1 WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;
