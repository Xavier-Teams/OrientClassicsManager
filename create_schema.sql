-- ============================================================================
-- OrientClassicsManager Database Schema
-- Based on shared/schema.ts Drizzle schema
-- ============================================================================

-- Create ENUMS
CREATE TYPE user_role AS ENUM (
  'chu_nhiem',              -- Chủ nhiệm
  'pho_chu_nhiem',          -- Phó Chủ nhiệm
  'truong_ban_thu_ky',      -- Trưởng ban Thư ký
  'thu_ky_hop_phan',        -- Thư ký hợp phần
  'van_phong',              -- Văn phòng
  'ke_toan',                -- Kế toán
  'van_thu',                -- Văn thư
  'bien_tap_vien',          -- Biên tập viên (BTV)
  'ky_thuat_vien',          -- Kỹ thuật viên (KTV)
  'dich_gia',               -- Dịch giả
  'chuyen_gia'              -- Chuyên gia
);

CREATE TYPE translation_status AS ENUM (
  'draft',                  -- Dự kiến
  'approved',               -- Đã duyệt
  'translator_assigned',    -- Đã gán dịch giả
  'trial_translation',      -- Dịch thử
  'trial_reviewed',         -- Đã thẩm định dịch thử
  'in_progress',            -- Đang dịch
  'progress_checked',       -- Đã kiểm tra tiến độ (KTTĐ)
  'completed',              -- Hoàn thành dịch
  'cancelled'               -- Đã hủy
);

CREATE TYPE contract_status AS ENUM (
  'draft',                  -- Dự thảo
  'pending_approval',       -- Chờ phê duyệt
  'signed',                 -- Đã ký
  'active',                 -- Đang thực hiện
  'completed',              -- Hoàn thành
  'terminated'              -- Chấm dứt
);

CREATE TYPE review_status AS ENUM (
  'pending',                -- Chờ thẩm định
  'in_progress',            -- Đang thẩm định
  'completed',              -- Đã hoàn thành
  'approved',               -- Đã phê duyệt
  'rejected'                -- Từ chối
);

CREATE TYPE priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE payment_status AS ENUM (
  'pending',                -- Chờ thanh toán
  'processing',             -- Đang xử lý
  'paid',                   -- Đã thanh toán
  'rejected'                -- Từ chối
);

CREATE TYPE payment_type AS ENUM (
  'advance_1',              -- Tạm ứng lần 1
  'advance_2',              -- Tạm ứng lần 2
  'final_settlement',       -- Quyết toán
  'bonus',                  -- Thưởng
  'other'                   -- Khác
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'thu_ky_hop_phan',
  avatar TEXT,
  phone TEXT,
  bio TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX username_idx ON users(username);
CREATE INDEX role_idx ON users(role);

-- ============================================================================
-- WORKS TABLE (Translation Works)
-- ============================================================================
CREATE TABLE works (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  author TEXT,
  source_language TEXT NOT NULL DEFAULT 'Hán văn',
  target_language TEXT NOT NULL DEFAULT 'Tiếng Việt',
  page_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  translation_part_id VARCHAR,
  translator_id VARCHAR REFERENCES users(id),
  
  -- Status tracking per phase
  translation_status translation_status NOT NULL DEFAULT 'draft',
  review_status review_status,
  
  priority priority NOT NULL DEFAULT 'normal',
  translation_progress INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  metadata JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for works
CREATE INDEX work_translator_idx ON works(translator_id);
CREATE INDEX work_translation_status_idx ON works(translation_status);
CREATE INDEX work_created_at_idx ON works(created_at);

-- ============================================================================
-- CONTRACTS TABLE
-- ============================================================================
CREATE TABLE contracts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  work_id VARCHAR NOT NULL REFERENCES works(id),
  translator_id VARCHAR NOT NULL REFERENCES users(id),
  total_amount INTEGER NOT NULL,
  signed_date TIMESTAMP,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status contract_status NOT NULL DEFAULT 'draft',
  terms TEXT,
  notes TEXT,
  created_by_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for contracts
CREATE INDEX contract_work_idx ON contracts(work_id);
CREATE INDEX contract_status_idx ON contracts(status);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id VARCHAR NOT NULL REFERENCES contracts(id),
  type payment_type NOT NULL,
  amount INTEGER NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  request_date TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_date TIMESTAMP,
  approved_by_id VARCHAR REFERENCES users(id),
  paid_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX payment_contract_idx ON payments(contract_id);
CREATE INDEX payment_status_idx ON payments(status);

-- ============================================================================
-- Insert sample data
-- ============================================================================

-- Insert sample users
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', '$2b$10$example_hash', 'Administrator', 'chu_nhiem', 'admin@orientclassics.vn'),
('secretary', '$2b$10$example_hash', 'Thư ký trưởng', 'truong_ban_thu_ky', 'secretary@orientclassics.vn'),
('translator1', '$2b$10$example_hash', 'Nguyễn Văn A', 'dich_gia', 'translator1@orientclassics.vn'),
('translator2', '$2b$10$example_hash', 'Trần Thị B', 'dich_gia', 'translator2@orientclassics.vn'),
('editor1', '$2b$10$example_hash', 'Lê Văn C', 'bien_tap_vien', 'editor1@orientclassics.vn');

-- Insert sample works
INSERT INTO works (name, author, description, translator_id, translation_status, created_by_id) 
SELECT 
  'Thiên Lam Tương Khí Tiền',
  'Tác giả cổ điển',
  'Tác phẩm kinh điển về võ thuật và triết học',
  u1.id,
  'approved',
  u2.id
FROM users u1, users u2 
WHERE u1.username = 'translator1' AND u2.username = 'admin';

INSERT INTO works (name, author, description, translator_id, translation_status, created_by_id)
SELECT 
  'Đạo Đức Kinh',
  'Lão Tử',
  'Kinh điển Đạo giáo nổi tiếng',
  u1.id,
  'in_progress',
  u2.id
FROM users u1, users u2 
WHERE u1.username = 'translator2' AND u2.username = 'admin';

-- Insert sample contracts
INSERT INTO contracts (contract_number, work_id, translator_id, total_amount, status, created_by_id)
SELECT 
  'HĐ-2025-001',
  w.id,
  w.translator_id,
  5000000,
  'signed',
  u.id
FROM works w, users u 
WHERE w.name = 'Thiên Lam Tương Khí Tiền' AND u.username = 'admin';

-- Insert sample payments
INSERT INTO payments (contract_id, type, amount, status)
SELECT 
  c.id,
  'advance_1',
  2000000,
  'paid'
FROM contracts c 
WHERE c.contract_number = 'HĐ-2025-001';

COMMIT;
