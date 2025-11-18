-- =====================================================
-- SQL Script để seed dữ liệu mẫu cho PostgreSQL
-- Dự án: Quản lý Dự án Kinh điển phương Đông
-- Database: translation_db
-- =====================================================

-- LƯU Ý: Script này giả định rằng:
-- 1. Các bảng đã được tạo thông qua Django migrations
-- 2. Bảng users đã có ít nhất 1 superuser (admin)
-- 3. Các foreign key constraints đã được thiết lập

-- =====================================================
-- BƯỚC 1: Xóa dữ liệu cũ (nếu cần)
-- =====================================================
-- Uncomment các dòng dưới nếu muốn xóa dữ liệu cũ trước khi insert
-- DELETE FROM translation_works;
-- DELETE FROM translation_parts WHERE code = 'DEFAULT';
-- DELETE FROM users WHERE role = 'dich_gia' AND email LIKE '%@orientclassics.vn';

-- =====================================================
-- BƯỚC 2: Tạo Hợp phần dịch thuật mặc định
-- =====================================================
INSERT INTO translation_parts (name, code, description, is_active, work_count, created_at, updated_at)
VALUES (
    'Hợp phần mặc định',
    'DEFAULT',
    'Hợp phần mặc định cho các tác phẩm',
    true,
    0, -- work_count mặc định = 0, sẽ được cập nhật sau khi insert works
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- BƯỚC 3: Tạo Admin User (nếu chưa có)
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
    'Admin', -- first_name
    '', -- last_name
    'Administrator', -- full_name
    'thu_ky_hop_phan',
    '', -- phone (empty string)
    '', -- bio (empty string)
    true,
    true,
    true,
    true,
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@orientclassics.vn');

-- =====================================================
-- BƯỚC 4: Tạo các Dịch giả (Translators)
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
-- BƯỚC 5: Tạo các Tác phẩm dịch thuật (Translation Works)
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
    '', -- name_original (empty string)
    'Khổng Tử biên soạn',
    'Hán văn',
    'Tiếng Việt',
    450,
    450 * 500, -- Estimate: 500 words per page
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'nguyen_van_a' LIMIT 1),
    'draft',
    '0', -- normal
    0,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Không rõ',
    'Hán văn',
    'Tiếng Việt',
    380,
    380 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    NULL,
    'draft',
    '0', -- normal
    0,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Phục Hy',
    'Hán văn',
    'Tiếng Việt',
    520,
    520 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    NULL,
    'draft',
    '1', -- high
    0,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Đại Thánh',
    'Hán văn',
    'Tiếng Việt',
    320,
    320 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'tran_thi_b' LIMIT 1),
    'approved',
    '0', -- normal
    5,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Khổng Tử',
    'Hán văn',
    'Tiếng Việt',
    280,
    280 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'le_van_c' LIMIT 1),
    'approved',
    '1', -- high
    8,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Khổng Tử',
    'Hán văn',
    'Tiếng Việt',
    350,
    350 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'pham_thi_d' LIMIT 1),
    'in_progress',
    '1', -- high
    65,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Mạnh Kha',
    'Hán văn',
    'Tiếng Việt',
    420,
    420 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'hoang_van_e' LIMIT 1),
    'in_progress',
    '0', -- normal
    45,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Khổng Cấp',
    'Hán văn',
    'Tiếng Việt',
    150,
    150 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'vo_thi_f' LIMIT 1),
    'in_progress',
    '2', -- urgent
    30,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Tử Tư',
    'Hán văn',
    'Tiếng Việt',
    180,
    180 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'dang_van_g' LIMIT 1),
    'in_progress',
    '1', -- high
    55,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Tôn Vũ',
    'Hán văn',
    'Tiếng Việt',
    220,
    220 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'bui_thi_h' LIMIT 1),
    'in_progress',
    '0', -- normal
    70,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Lão Tử',
    'Hán văn',
    'Tiếng Việt',
    290,
    290 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'mai_van_i' LIMIT 1),
    'progress_checked',
    '1', -- high
    85,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Trang Chu',
    'Hán văn',
    'Tiếng Việt',
    410,
    410 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'dinh_thi_k' LIMIT 1),
    'progress_checked',
    '0', -- normal
    80,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Mặc Địch',
    'Hán văn',
    'Tiếng Việt',
    340,
    340 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ly_van_l' LIMIT 1),
    'progress_checked',
    '0', -- normal
    88,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Hàn Phi',
    'Hán văn',
    'Tiếng Việt',
    380,
    380 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'phan_thi_m' LIMIT 1),
    'completed',
    '0', -- normal
    100,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Tuân Huống',
    'Hán văn',
    'Tiếng Việt',
    310,
    310 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ta_van_n' LIMIT 1),
    'completed',
    '0', -- normal
    100,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Liệt Ngự Khấu',
    'Hán văn',
    'Tiếng Việt',
    260,
    260 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'vu_thi_o' LIMIT 1),
    'completed',
    '0', -- normal
    100,
    '', -- notes (empty string)
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
    '', -- name_original (empty string)
    'Quản Trọng',
    'Hán văn',
    'Tiếng Việt',
    330,
    330 * 500,
    '', -- description (empty string)
    (SELECT id FROM translation_parts WHERE code = 'DEFAULT' LIMIT 1),
    (SELECT id FROM users WHERE username = 'duong_van_p' LIMIT 1),
    'completed',
    '0', -- normal
    100,
    '', -- notes (empty string)
    true,
    (SELECT id FROM users WHERE is_superuser = true LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM translation_works WHERE name = 'Quản Tử');

-- =====================================================
-- BƯỚC 6: Cập nhật work_count cho translation_part
-- =====================================================
UPDATE translation_parts 
SET work_count = COALESCE((
    SELECT COUNT(*) 
    FROM translation_works 
    WHERE translation_part_id = translation_parts.id AND active = true
), 0)
WHERE code = 'DEFAULT';

-- =====================================================
-- BƯỚC 7: Xác minh dữ liệu đã được insert
-- =====================================================
SELECT 
    'Translation Parts' as table_name,
    COUNT(*) as count
FROM translation_parts
WHERE code = 'DEFAULT'

UNION ALL

SELECT 
    'Translators (Users)' as table_name,
    COUNT(*) as count
FROM users
WHERE role = 'dich_gia' AND email LIKE '%@orientclassics.vn'

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
--
-- 2. Hoặc chạy Django seed command để có password đúng:
--    python manage.py seed_works
--
-- 3. Script này sử dụng WHERE NOT EXISTS để tránh duplicate
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
-- 9. Nếu muốn xóa dữ liệu cũ, uncomment phần DELETE ở đầu script
--
-- 10. Để chạy script này trong PostgreSQL:
--    psql -U your_username -d translation_db -f SQL_SEED_DATA.sql
--    hoặc copy-paste vào pgAdmin Query Tool
-- =====================================================
