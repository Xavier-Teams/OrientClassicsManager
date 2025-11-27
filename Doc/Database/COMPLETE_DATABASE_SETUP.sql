-- =====================================================
-- Script SQL HOÀN CHỈNH để tạo Database và Insert Dữ liệu
-- Dự án: Quản lý Dự án Kinh điển phương Đông
-- =====================================================
--
-- Script này bao gồm:
-- 1. Tạo Database
-- 2. Tạo Extensions
-- 3. Tạo các bảng (schema)
-- 4. Insert dữ liệu mẫu
--
-- LƯU Ý: Script này cần chạy với quyền superuser (thường là user 'postgres')
-- =====================================================

-- =====================================================
-- PHẦN 1: TẠO DATABASE
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
-- PHẦN 2: KẾT NỐI VÀO DATABASE MỚI
-- =====================================================
-- Trong psql, chạy: \c translation_db
-- Trong pgAdmin4, chọn database translation_db trong Query Tool
-- Sau đó tiếp tục chạy các phần dưới

-- =====================================================
-- PHẦN 3: TẠO EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Cho UUID generation (nếu cần)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Cho full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- Cho search không dấu

-- =====================================================
-- PHẦN 4: TẠO CÁC BẢNG (SCHEMA)
-- =====================================================
-- LƯU Ý: Phần này tạo schema thủ công. 
-- Nếu bạn sử dụng Django, nên chạy: python manage.py migrate
-- để Django tự động tạo schema từ migrations

-- Bảng: users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL UNIQUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'thu_ky_hop_phan',
    phone VARCHAR(20) NOT NULL DEFAULT '',
    avatar VARCHAR(100) NULL,
    bio TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho bảng users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Bảng: auth_group (Django groups)
CREATE TABLE IF NOT EXISTS auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

-- Bảng: auth_permission (Django permissions)
CREATE TABLE IF NOT EXISTS auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL,
    codename VARCHAR(100) NOT NULL,
    UNIQUE(content_type_id, codename)
);

-- Bảng: users_groups (Many-to-Many: users <-> groups)
CREATE TABLE IF NOT EXISTS users_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);

-- Bảng: users_user_permissions (Many-to-Many: users <-> permissions)
CREATE TABLE IF NOT EXISTS users_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(user_id, permission_id)
);

-- Bảng: translation_parts (Hợp phần dịch thuật)
CREATE TABLE IF NOT EXISTS translation_parts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    manager_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    team_leader_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    co_team_leader_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    work_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho bảng translation_parts
CREATE INDEX IF NOT EXISTS idx_translation_parts_code ON translation_parts(code);
CREATE INDEX IF NOT EXISTS idx_translation_parts_manager ON translation_parts(manager_id);
CREATE INDEX IF NOT EXISTS idx_translation_parts_team_leader ON translation_parts(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_translation_parts_is_active ON translation_parts(is_active);

-- Bảng: translation_works (Tác phẩm dịch thuật)
CREATE TABLE IF NOT EXISTS translation_works (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    name_original VARCHAR(500) NOT NULL DEFAULT '',
    author VARCHAR(200) NOT NULL DEFAULT '',
    source_language VARCHAR(50) NOT NULL DEFAULT 'Hán văn',
    target_language VARCHAR(50) NOT NULL DEFAULT 'Tiếng Việt',
    page_count INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    translation_part_id BIGINT NULL REFERENCES translation_parts(id) ON DELETE SET NULL,
    translator_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'draft',
    priority VARCHAR(1) NOT NULL DEFAULT '0',
    translation_progress INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes cho bảng translation_works
CREATE INDEX IF NOT EXISTS idx_translation_works_translator ON translation_works(translator_id);
CREATE INDEX IF NOT EXISTS idx_translation_works_translation_part ON translation_works(translation_part_id);
CREATE INDEX IF NOT EXISTS idx_translation_works_state ON translation_works(state);
CREATE INDEX IF NOT EXISTS idx_translation_works_priority ON translation_works(priority);
CREATE INDEX IF NOT EXISTS idx_translation_works_active ON translation_works(active);
CREATE INDEX IF NOT EXISTS idx_translation_works_created_at ON translation_works(created_at);
CREATE INDEX IF NOT EXISTS idx_translation_works_created_by ON translation_works(created_by_id);

-- Bảng: translation_contracts (Hợp đồng dịch thuật)
CREATE TABLE IF NOT EXISTS translation_contracts (
    id BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    work_id BIGINT NOT NULL UNIQUE REFERENCES translation_works(id) ON DELETE CASCADE,
    translator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    advance_payment_1 DECIMAL(15, 2) NOT NULL DEFAULT 0,
    advance_payment_2 DECIMAL(15, 2) NOT NULL DEFAULT 0,
    final_payment DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    contract_file VARCHAR(100) NULL,
    signed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes cho bảng translation_contracts
CREATE INDEX IF NOT EXISTS idx_translation_contracts_work ON translation_contracts(work_id);
CREATE INDEX IF NOT EXISTS idx_translation_contracts_translator ON translation_contracts(translator_id);
CREATE INDEX IF NOT EXISTS idx_translation_contracts_status ON translation_contracts(status);
CREATE INDEX IF NOT EXISTS idx_translation_contracts_contract_number ON translation_contracts(contract_number);

-- =====================================================
-- PHẦN 5: INSERT DỮ LIỆU MẪU
-- =====================================================

-- =====================================================
-- BƯỚC 5.1: Tạo Hợp phần dịch thuật mặc định
-- =====================================================
INSERT INTO translation_parts (name, code, description, is_active, work_count, created_at, updated_at)
VALUES (
    'Hợp phần mặc định',
    'DEFAULT',
    'Hợp phần mặc định cho các tác phẩm',
    true,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- BƯỚC 5.2: Tạo các Hợp phần dịch thuật khác
-- =====================================================
INSERT INTO translation_parts (name, code, description, is_active, work_count, created_at, updated_at)
VALUES 
    (
        'Hợp phần Phật tạng toàn dịch',
        'PHAT_TANG_TOAN_DICH',
        'Hợp phần dịch thuật toàn bộ Phật tạng',
        true,
        0,
        NOW(),
        NOW()
    ),
    (
        'Hợp phần Phật tạng tinh yếu',
        'PHAT_TANG_TINH_YEU',
        'Hợp phần dịch thuật tinh yếu Phật tạng',
        true,
        0,
        NOW(),
        NOW()
    ),
    (
        'Hợp phần Nho tạng toàn dịch',
        'NHO_TANG_TOAN_DICH',
        'Hợp phần dịch thuật toàn bộ Nho tạng',
        true,
        0,
        NOW(),
        NOW()
    ),
    (
        'Hợp phần Phật điển Việt Nam',
        'PHAT_DIEN_VIET_NAM',
        'Hợp phần dịch thuật Phật điển Việt Nam',
        true,
        0,
        NOW(),
        NOW()
    ),
    (
        'Hợp phần Nho điển Việt Nam',
        'NHO_DIEN_VIET_NAM',
        'Hợp phần dịch thuật Nho điển Việt Nam',
        true,
        0,
        NOW(),
        NOW()
    )
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- BƯỚC 5.3: Tạo Admin User (nếu chưa có)
-- =====================================================
INSERT INTO users (
    username, email, password, first_name, last_name, full_name, role, phone, bio,
    is_superuser, is_staff, is_active, active, 
    date_joined, created_at, updated_at
)
SELECT 
    'admin',
    'admin@orientclassics.vn',
    'pbkdf2_sha256$600000$dummy$dummy=', -- Password: password123 (cần update sau bằng Django)
    'Admin',
    '',
    'Administrator',
    'thu_ky_hop_phan',
    '',
    '',
    true,
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@orientclassics.vn');

-- =====================================================
-- BƯỚC 5.4: Tạo các Dịch giả (Translators)
-- =====================================================
-- Lưu ý: Password hash là placeholder, cần update sau bằng Django
-- Tách full_name thành first_name và last_name để đáp ứng constraint NOT NULL
-- phone và bio được set = '' (empty string) để đáp ứng constraint NOT NULL
-- is_superuser và is_staff được set = false cho translators (không phải admin)
INSERT INTO users (username, email, password, first_name, last_name, full_name, role, phone, bio, is_superuser, is_staff, is_active, active, date_joined, created_at, updated_at)
VALUES 
    ('nguyen_van_a', 'nguyen.van.a@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Nguyễn Văn', 'A', 'Nguyễn Văn A', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('tran_thi_b', 'tran.thi.b@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Trần Thị', 'B', 'Trần Thị B', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('le_van_c', 'le.van.c@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Lê Văn', 'C', 'Lê Văn C', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('pham_thi_d', 'pham.thi.d@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Phạm Thị', 'D', 'Phạm Thị D', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('hoang_van_e', 'hoang.van.e@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Hoàng Văn', 'E', 'Hoàng Văn E', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('vo_thi_f', 'vo.thi.f@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Võ Thị', 'F', 'Võ Thị F', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('dang_van_g', 'dang.van.g@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Đặng Văn', 'G', 'Đặng Văn G', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('bui_thi_h', 'bui.thi.h@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Bùi Thị', 'H', 'Bùi Thị H', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('mai_van_i', 'mai.van.i@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Mai Văn', 'I', 'Mai Văn I', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('dinh_thi_k', 'dinh.thi.k@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Đinh Thị', 'K', 'Đinh Thị K', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('ly_van_l', 'ly.van.l@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Lý Văn', 'L', 'Lý Văn L', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('phan_thi_m', 'phan.thi.m@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Phan Thị', 'M', 'Phan Thị M', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('ta_van_n', 'ta.van.n@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Tạ Văn', 'N', 'Tạ Văn N', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('vu_thi_o', 'vu.thi.o@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Vũ Thị', 'O', 'Vũ Thị O', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW()),
    ('duong_van_p', 'duong.van.p@orientclassics.vn', 'pbkdf2_sha256$600000$dummy$dummy=', 'Dương Văn', 'P', 'Dương Văn P', 'dich_gia', '', '', false, false, true, true, NOW(), NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    is_superuser = EXCLUDED.is_superuser,
    is_staff = EXCLUDED.is_staff,
    is_active = EXCLUDED.is_active,
    active = EXCLUDED.active,
    updated_at = NOW();

-- =====================================================
-- BƯỚC 5.5: Tạo các Tác phẩm dịch thuật (Translation Works)
-- =====================================================

-- DRAFT - Dự kiến (3 works)
INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Thi Kinh (Kinh Thi)',
    '',
    'Khổng Tử biên soạn',
    'Hán văn',
    'Tiếng Việt',
    450,
    450 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'nguyen_van_a' LIMIT 1),
    'draft',
    '0',
    0,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Thi Kinh (Kinh Thi)');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Thư Kinh (Kinh Thư)',
    '',
    'Không rõ',
    'Hán văn',
    'Tiếng Việt',
    380,
    380 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    NULL,
    'draft',
    '0',
    0,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Thư Kinh (Kinh Thư)');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Dịch Kinh (Kinh Dịch)',
    '',
    'Phục Hy',
    'Hán văn',
    'Tiếng Việt',
    520,
    520 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    NULL,
    'draft',
    '1',
    0,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Dịch Kinh (Kinh Dịch)');

-- APPROVED - Đã duyệt (2 works)
INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Lễ Ký',
    '',
    'Đại Thánh',
    'Hán văn',
    'Tiếng Việt',
    320,
    320 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'tran_thi_b' LIMIT 1),
    'approved',
    '0',
    5,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Lễ Ký');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Xuân Thu',
    '',
    'Khổng Tử',
    'Hán văn',
    'Tiếng Việt',
    280,
    280 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'le_van_c' LIMIT 1),
    'approved',
    '1',
    8,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Xuân Thu');

-- IN_PROGRESS - Đang dịch (5 works)
INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Luận Ngữ',
    '',
    'Khổng Tử',
    'Hán văn',
    'Tiếng Việt',
    350,
    350 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'pham_thi_d' LIMIT 1),
    'in_progress',
    '1',
    65,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Luận Ngữ');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Mạnh Tử',
    '',
    'Mạnh Kha',
    'Hán văn',
    'Tiếng Việt',
    420,
    420 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'hoang_van_e' LIMIT 1),
    'in_progress',
    '0',
    45,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Mạnh Tử');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Đại Học',
    '',
    'Khổng Cấp',
    'Hán văn',
    'Tiếng Việt',
    150,
    150 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'vo_thi_f' LIMIT 1),
    'in_progress',
    '2',
    30,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Đại Học');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Trung Dung',
    '',
    'Tử Tư',
    'Hán văn',
    'Tiếng Việt',
    180,
    180 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'dang_van_g' LIMIT 1),
    'in_progress',
    '1',
    55,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Trung Dung');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Tôn Tử Binh Pháp',
    '',
    'Tôn Vũ',
    'Hán văn',
    'Tiếng Việt',
    220,
    220 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'bui_thi_h' LIMIT 1),
    'in_progress',
    '0',
    70,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Tôn Tử Binh Pháp');

-- PROGRESS_CHECKED - Đã kiểm tra tiến độ (3 works)
INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Đạo Đức Kinh',
    '',
    'Lão Tử',
    'Hán văn',
    'Tiếng Việt',
    290,
    290 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'mai_van_i' LIMIT 1),
    'progress_checked',
    '1',
    85,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Đạo Đức Kinh');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Trang Tử',
    '',
    'Trang Chu',
    'Hán văn',
    'Tiếng Việt',
    410,
    410 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'dinh_thi_k' LIMIT 1),
    'progress_checked',
    '0',
    80,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Trang Tử');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Mặc Tử',
    '',
    'Mặc Địch',
    'Hán văn',
    'Tiếng Việt',
    340,
    340 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ly_van_l' LIMIT 1),
    'progress_checked',
    '0',
    88,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Mặc Tử');

-- COMPLETED - Hoàn thành (4 works)
INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Hàn Phi Tử',
    '',
    'Hàn Phi',
    'Hán văn',
    'Tiếng Việt',
    380,
    380 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'phan_thi_m' LIMIT 1),
    'completed',
    '0',
    100,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Hàn Phi Tử');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Tuân Tử',
    '',
    'Tuân Huống',
    'Hán văn',
    'Tiếng Việt',
    310,
    310 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ta_van_n' LIMIT 1),
    'completed',
    '0',
    100,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Tuân Tử');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Liệt Tử',
    '',
    'Liệt Ngự Khấu',
    'Hán văn',
    'Tiếng Việt',
    260,
    260 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'vu_thi_o' LIMIT 1),
    'completed',
    '0',
    100,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Liệt Tử');

INSERT INTO translation_works (
    name, name_original, author, source_language, target_language,
    page_count, word_count, description,
    translation_part_id, translator_id,
    state, priority, translation_progress, notes,
    active, created_by_id, created_at, updated_at
)
SELECT 
    'Quản Tử',
    '',
    'Quản Trọng',
    'Hán văn',
    'Tiếng Việt',
    330,
    330 * 500,
    '',
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'duong_van_p' LIMIT 1),
    'completed',
    '0',
    100,
    '',
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Quản Tử');

-- =====================================================
-- BƯỚC 5.6: Cập nhật work_count cho translation_part
-- =====================================================
UPDATE translation_parts 
SET work_count = COALESCE((
    SELECT COUNT(*) 
    FROM translation_works 
    WHERE translation_part_id = translation_parts.id AND active = true
), 0);

-- =====================================================
-- PHẦN 6: XÁC MINH DỮ LIỆU ĐÃ ĐƯỢC INSERT
-- =====================================================
SELECT 
    'Translation Parts' as table_name,
    COUNT(*) as count
FROM translation_parts

UNION ALL

SELECT 
    'Translators (Users)' as table_name,
    COUNT(*) as count
FROM users
WHERE role = 'dich_gia' AND email LIKE '%@orientclassics.vn'

UNION ALL

SELECT 
    'Admin Users' as table_name,
    COUNT(*) as count
FROM users
WHERE is_superuser = true

UNION ALL

SELECT 
    'Translation Works' as table_name,
    COUNT(*) as count
FROM translation_works
WHERE active = true

UNION ALL

SELECT 
    'Works by Status: ' || state as table_name,
    COUNT(*) as count
FROM translation_works
WHERE active = true
GROUP BY state
ORDER BY table_name;

-- =====================================================
-- LƯU Ý QUAN TRỌNG:
-- =====================================================
-- 1. Password hash trong script này là placeholder
--    Cần update password bằng Django command:
--    
--    python manage.py shell
--    >>> from users.models import User
--    >>> for user in User.objects.filter(role='dich_gia'):
--    ...     user.set_password('password123')
--    ...     user.save()
--    >>> admin = User.objects.get(username='admin')
--    ... admin.set_password('your_admin_password')
--    ... admin.save()
--
-- 2. Hoặc chạy Django seed command để có password đúng:
--    python manage.py seed_works
--
-- 3. Script này sử dụng WHERE NOT EXISTS và ON CONFLICT để tránh duplicate
--    Có thể chạy nhiều lần mà không bị lỗi
--
-- 4. work_count trong translation_parts được set = 0 khi insert
--    và sẽ được tự động cập nhật sau khi insert tất cả works
--
-- 5. first_name và last_name là bắt buộc (NOT NULL) trong Django AbstractUser
--    Script đã tách full_name thành first_name và last_name cho tất cả users
--    Ví dụ: "Nguyễn Văn A" -> first_name="Nguyễn Văn", last_name="A"
--
-- 6. phone và bio là bắt buộc (NOT NULL) trong database
--    Script đã set phone = '' và bio = '' (empty string) cho tất cả users
--    Có thể cập nhật sau bằng cách UPDATE users SET phone = '...', bio = '...' WHERE ...
--
-- 7. is_superuser và is_staff là bắt buộc (NOT NULL) trong Django AbstractUser
--    Script đã set is_superuser = false và is_staff = false cho translators
--    Admin user có is_superuser = true và is_staff = true
--
-- 8. name_original, description và notes trong translation_works là bắt buộc (NOT NULL) trong database
--    Script đã set name_original = '', description = '' và notes = '' (empty string) cho tất cả works
--    Có thể cập nhật sau bằng cách UPDATE translation_works SET name_original = '...', description = '...', notes = '...' WHERE ...
--
-- 9. Nếu bạn sử dụng Django migrations, có thể bỏ qua phần CREATE TABLE ở trên
--    và chỉ chạy: python manage.py migrate
--    Sau đó chạy phần INSERT DATA từ dòng này trở đi
--
-- 10. Để chạy script này trong PostgreSQL:
--     psql -U postgres -f COMPLETE_DATABASE_SETUP.sql
--     hoặc copy-paste vào pgAdmin Query Tool
-- =====================================================

