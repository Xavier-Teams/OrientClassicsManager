-- =====================================================
-- Script SQL để tạo Database mới hoàn toàn
-- Dự án: Quản lý Dự án Kinh điển phương Đông
-- =====================================================

-- LƯU Ý: Script này cần chạy với quyền superuser (thường là user 'postgres')
-- Chạy script này TRƯỚC KHI chạy Django migrations

-- =====================================================
-- BƯỚC 1: Tạo Database
-- =====================================================

-- Xóa database cũ nếu tồn tại (CẨN THẬN: Sẽ xóa toàn bộ dữ liệu!)
-- Uncomment dòng dưới nếu muốn xóa database cũ
-- DROP DATABASE IF EXISTS translation_db;

-- Tạo database mới
CREATE DATABASE translation_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Vietnamese_Vietnam.1258'
    LC_CTYPE = 'Vietnamese_Vietnam.1258'
    TEMPLATE = template0
    CONNECTION LIMIT = -1;

-- Comment cho database
COMMENT ON DATABASE translation_db IS 'Database cho dự án Quản lý Dự án Kinh điển phương Đông';

-- =====================================================
-- BƯỚC 2: Kết nối vào database mới
-- =====================================================
-- Trong psql, chạy: \c translation_db
-- Trong pgAdmin4, chọn database translation_db trong Query Tool

-- =====================================================
-- BƯỚC 3: Tạo Extensions (nếu cần)
-- =====================================================
-- Uncomment nếu cần các extensions sau:

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Cho UUID generation
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Cho full-text search
-- CREATE EXTENSION IF NOT EXISTS "unaccent";    -- Cho search không dấu

-- =====================================================
-- BƯỚC 4: Sau khi chạy script này
-- =====================================================
-- 1. Chạy Django migrations để tạo schema:
--    cd backend-django
--    python manage.py migrate
--
-- 2. Chạy SQL seed script để insert dữ liệu:
--    Trong pgAdmin4: Mở SQL_SEED_DATA.sql và Execute
--
-- 3. Tạo superuser:
--    python manage.py createsuperuser

-- =====================================================
-- Xác minh Database đã được tạo
-- =====================================================
-- Chạy query sau để kiểm tra:
-- SELECT datname, encoding, datcollate, datctype 
-- FROM pg_database 
-- WHERE datname = 'translation_db';

