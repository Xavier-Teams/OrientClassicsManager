DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'works' AND column_name = 'review_count'
  ) THEN
    ALTER TABLE works ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'works' AND column_name = 'editing_task_count'
  ) THEN
    ALTER TABLE works ADD COLUMN editing_task_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION inc_review_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE works SET review_count = review_count + 1 WHERE id = NEW.work_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dec_review_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE works SET review_count = GREATEST(review_count - 1, 0) WHERE id = OLD.work_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reviews_inc'
  ) THEN
    CREATE TRIGGER trg_reviews_inc AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION inc_review_count();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reviews_dec'
  ) THEN
    CREATE TRIGGER trg_reviews_dec AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION dec_review_count();
  END IF;
END$$;

CREATE OR REPLACE FUNCTION inc_editing_task_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE works SET editing_task_count = editing_task_count + 1 WHERE id = NEW.work_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dec_editing_task_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE works SET editing_task_count = GREATEST(editing_task_count - 1, 0) WHERE id = OLD.work_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_editing_tasks_inc'
  ) THEN
    CREATE TRIGGER trg_editing_tasks_inc AFTER INSERT ON editing_tasks
    FOR EACH ROW EXECUTE FUNCTION inc_editing_task_count();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_editing_tasks_dec'
  ) THEN
    CREATE TRIGGER trg_editing_tasks_dec AFTER DELETE ON editing_tasks
    FOR EACH ROW EXECUTE FUNCTION dec_editing_task_count();
  END IF;
END$$;
