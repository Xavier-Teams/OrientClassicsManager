-- =====================================================
-- SQL Script để thêm các Hợp phần dịch thuật vào database
-- Dự án: Quản lý Dự án Kinh điển phương Đông
-- Database: translation_db
-- =====================================================

-- LƯU Ý: Script này giả định rằng:
-- 1. Bảng translation_parts đã được tạo thông qua Django migrations
-- 2. Các foreign key constraints đã được thiết lập

-- =====================================================
-- Thêm các Hợp phần dịch thuật
-- =====================================================
INSERT INTO translation_parts (name, code, description, is_active, work_count, created_at, updated_at)
VALUES 
    (
        'Hợp phần Phật tạng toàn dịch',
        'PHAT_TANG_TOAN_DICH',
        'Hợp phần dịch thuật toàn bộ Phật tạng',
        true,
        0, -- work_count mặc định = 0, sẽ được cập nhật tự động
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
-- Xác minh dữ liệu đã được insert
-- =====================================================
SELECT 
    id,
    name,
    code,
    description,
    is_active,
    work_count,
    created_at
FROM translation_parts
WHERE code IN (
    'PHAT_TANG_TOAN_DICH',
    'PHAT_TANG_TINH_YEU',
    'NHO_TANG_TOAN_DICH',
    'PHAT_DIEN_VIET_NAM',
    'NHO_DIEN_VIET_NAM'
)
ORDER BY code;

