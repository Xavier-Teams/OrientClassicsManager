# 🗄️ DATABASE DOCUMENTATION

## 📋 Mục lục

1. [Database Schema](#database-schema)
2. [Seed Data](#seed-data)
3. [Migrations](#migrations)
4. [Relationships](#relationships)

---

## Database Schema

### Core Tables

#### users
- `id` (UUID, PK)
- `username` (VARCHAR, UNIQUE)
- `email` (VARCHAR, UNIQUE)
- `full_name` (VARCHAR)
- `role` (VARCHAR) - chu_nhiem, thu_ky, dich_gia, etc.
- `phone` (VARCHAR)
- `avatar` (TEXT)
- `bio` (TEXT)
- `active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### translation_parts
- `id` (UUID, PK)
- `name` (VARCHAR)
- `code` (VARCHAR, UNIQUE)
- `description` (TEXT)
- `manager_id` (UUID, FK → users)
- `team_leader_id` (UUID, FK → users)
- `co_team_leader_id` (UUID, FK → users)
- `work_count` (INTEGER) - Computed
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### works (translation_works)
- `id` (UUID, PK)
- `name` (VARCHAR)
- `name_original` (VARCHAR)
- `author` (VARCHAR)
- `source_language` (VARCHAR)
- `target_language` (VARCHAR)
- `page_count` (INTEGER)
- `word_count` (INTEGER)
- `description` (TEXT)
- `translation_part_id` (UUID, FK → translation_parts)
- `translator_id` (UUID, FK → users)
- `state` (VARCHAR) - FSM state
- `priority` (VARCHAR) - 0, 1, 2
- `translation_progress` (INTEGER)
- `notes` (TEXT)
- `active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by_id` (UUID, FK → users)

#### contracts (translation_contracts)
- `id` (UUID, PK)
- `contract_number` (VARCHAR, UNIQUE)
- `work_id` (UUID, FK → works, UNIQUE)
- `translator_id` (UUID, FK → users)
- `start_date` (DATE)
- `end_date` (DATE)
- `total_amount` (DECIMAL)
- `advance_payment_1` (DECIMAL)
- `advance_payment_2` (DECIMAL)
- `final_payment` (DECIMAL)
- `status` (VARCHAR)
- `contract_file` (TEXT)
- `signed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by_id` (UUID, FK → users)

#### documents
- `id` (UUID, PK)
- `work_id` (UUID, FK → works)
- `name` (TEXT)
- `type` (VARCHAR) - source, translation, review, etc.
- `file_url` (TEXT)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `version` (INTEGER)
- `previous_version_id` (UUID, FK → documents)
- `uploaded_by_id` (UUID, FK → users)
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### review_councils
- `id` (UUID, PK)
- `work_id` (UUID, FK → works)
- `name` (VARCHAR)
- `type` (VARCHAR) - tdbdt, kttd, tdccg, ntcda
- `status` (VARCHAR)
- `meeting_date` (TIMESTAMP)
- `created_at` (TIMESTAMP)

#### reviews
- `id` (UUID, PK)
- `work_id` (UUID, FK → works)
- `council_id` (UUID, FK → review_councils)
- `reviewer_id` (UUID, FK → users)
- `status` (VARCHAR)
- `evaluation` (TEXT)
- `created_at` (TIMESTAMP)

---

## Seed Data

### Chạy Seed Script

```bash
npm run db:seed
```

### Dữ liệu được tạo

#### Users (15 users)
- **Leadership**: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký
- **Secretaries**: Thư ký hợp phần 1, 2
- **Office & Finance**: Văn phòng, Kế toán
- **Translators**: Dịch giả 1, 2, 3 (chuyên các lĩnh vực khác nhau)
- **Editors**: BTV 1, 2
- **Technical**: KTV 1
- **Experts**: Chuyên gia 1, 2

**Tất cả users có password:** `password123`

#### Works (6 works)
- Kinh Kim Cương (Phật giáo)
- Luận Ngữ (Nho giáo)
- Đạo Đức Kinh (Đạo giáo)
- Kinh Dịch (Nho giáo)
- Trang Tử (Đạo giáo)
- Tứ Thư (Nho giáo)

#### Contracts (4 contracts)
- Hợp đồng với các trạng thái khác nhau
- Payment milestones và payments

#### Reviews
- Review councils
- Review evaluations

---

## Migrations

### Express/Drizzle

```bash
# Push schema changes
npm run db:push
```

### Django

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Fake migrations nếu tables đã tồn tại
python manage.py migrate --fake <app> <migration>
```

---

## Relationships

### TranslationPart → Works
- One-to-Many: Một hợp phần có nhiều works
- Foreign Key: `works.translation_part_id`

### Work → Contract
- One-to-One: Một work có một contract
- Foreign Key: `contracts.work_id` (UNIQUE)

### Work → Translator
- Many-to-One: Nhiều works có thể thuộc một translator
- Foreign Key: `works.translator_id`

### Work → Documents
- One-to-Many: Một work có nhiều documents
- Foreign Key: `documents.work_id`

### Document → Previous Version
- Self-referential: Document có thể có previous version
- Foreign Key: `documents.previous_version_id`

---

## Indexes

### Recommended Indexes

```sql
-- Works indexes
CREATE INDEX idx_works_state ON works(state);
CREATE INDEX idx_works_translator ON works(translator_id);
CREATE INDEX idx_works_part ON works(translation_part_id);
CREATE INDEX idx_works_priority ON works(priority);

-- Contracts indexes
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_work ON contracts(work_id);

-- Documents indexes
CREATE INDEX idx_documents_work ON documents(work_id);
CREATE INDEX idx_documents_type ON documents(type);
```

---

## Best Practices

1. **Use Foreign Keys** - Đảm bảo data integrity
2. **Add Indexes** - Cho các fields thường query
3. **Use Transactions** - Cho operations phức tạp
4. **Backup Regularly** - Trước khi migrate
5. **Test Migrations** - Trên dev environment trước

---

**Xem thêm:**
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup guide
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development guide

