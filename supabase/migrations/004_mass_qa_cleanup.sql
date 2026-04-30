-- Mass QA cleanup: reset threads, categories, subcategories
-- Applied directly via REST API (2026-04-30); kept here for record.

-- 1. Delete all threads except the Liga 1 thread (cascade deletes comments + reactions)
-- DELETE FROM threads
-- WHERE title != 'Menurut kalian siapa pemain terbaik Liga 1 musim ini?';

-- 2. Wipe existing subcategories and categories
-- DELETE FROM subcategories;
-- DELETE FROM categories;

-- 3. Insert new categories (IDs auto-assigned: 7=Kehidupan, 8=Cinta, 9=Uang)
-- INSERT INTO categories (name, slug, icon) VALUES
--   ('Kehidupan', 'kehidupan', '💬'),
--   ('Cinta',     'cinta',     '❤️'),
--   ('Uang',      'uang',      '💰');

-- 4. Insert new subcategories (IDs: 23=Kehidupan, 24=Cinta, 25=Uang)
-- INSERT INTO subcategories (category_id, name, slug) VALUES
--   (7, 'Kehidupan', 'kehidupan'),
--   (8, 'Cinta',     'cinta'),
--   (9, 'Uang',      'uang');

-- 5. Move surviving Liga 1 thread into Kehidupan subcategory (id=23)
-- UPDATE threads
-- SET subcategory_id = 23
-- WHERE title = 'Menurut kalian siapa pemain terbaik Liga 1 musim ini?';

-- NOTE: All steps executed via Supabase REST API. Sequences not reset;
-- new IDs continue from sequence values at time of execution.
