-- =====================================================
-- TẠO BẢNG TRANSLATORS (Dịch giả)
-- =====================================================
-- Bảng này lưu thông tin dịch giả, tách riêng khỏi bảng users
-- Dịch giả không phải là users của hệ thống, chỉ để tham chiếu trong hợp đồng và biểu mẫu

CREATE TABLE IF NOT EXISTS translators (
    id BIGSERIAL PRIMARY KEY,
    
    -- Thông tin cơ bản
    full_name VARCHAR(200) NOT NULL,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    
    -- Thông tin CMND/CCCD
    id_card_number VARCHAR(20) NULL UNIQUE,  -- Số CMND/CCCD
    id_card_issue_date DATE NULL,            -- Ngày cấp
    id_card_issue_place VARCHAR(200) NULL,  -- Nơi cấp
    
    -- Thông tin liên hệ
    workplace VARCHAR(200) NULL,             -- Nơi công tác
    address TEXT NULL,                       -- Địa chỉ
    phone VARCHAR(20) NULL,                  -- Số điện thoại
    email VARCHAR(254) NULL,                -- Email
    
    -- Thông tin ngân hàng
    bank_account_number VARCHAR(50) NULL,    -- Số tài khoản
    bank_name VARCHAR(200) NULL,             -- Tên ngân hàng
    bank_branch VARCHAR(200) NULL,           -- Chi nhánh ngân hàng
    
    -- Thông tin thuế
    tax_code VARCHAR(20) NULL,               -- Mã số thuế TNCN
    
    -- Trạng thái
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Optional: Link với user nếu dịch giả cũng là user của hệ thống
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes cho bảng translators
CREATE INDEX IF NOT EXISTS idx_translators_full_name ON translators(full_name);
CREATE INDEX IF NOT EXISTS idx_translators_id_card ON translators(id_card_number);
CREATE INDEX IF NOT EXISTS idx_translators_email ON translators(email);
CREATE INDEX IF NOT EXISTS idx_translators_phone ON translators(phone);
CREATE INDEX IF NOT EXISTS idx_translators_active ON translators(active);
CREATE INDEX IF NOT EXISTS idx_translators_user_id ON translators(user_id);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_translators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_translators_updated_at
    BEFORE UPDATE ON translators
    FOR EACH ROW
    EXECUTE FUNCTION update_translators_updated_at();

-- Trigger để tự động tạo full_name từ first_name + last_name
CREATE OR REPLACE FUNCTION update_translators_full_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
        NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_translators_full_name
    BEFORE INSERT OR UPDATE ON translators
    FOR EACH ROW
    EXECUTE FUNCTION update_translators_full_name();

-- Comments
COMMENT ON TABLE translators IS 'Bảng lưu thông tin dịch giả, tách riêng khỏi users';
COMMENT ON COLUMN translators.user_id IS 'Link với users nếu dịch giả cũng là user của hệ thống (optional)';
COMMENT ON COLUMN translators.id_card_number IS 'Số CMND/CCCD';
COMMENT ON COLUMN translators.id_card_issue_date IS 'Ngày cấp CMND/CCCD';
COMMENT ON COLUMN translators.id_card_issue_place IS 'Nơi cấp CMND/CCCD';
COMMENT ON COLUMN translators.tax_code IS 'Mã số thuế TNCN (Thuế thu nhập cá nhân)';

