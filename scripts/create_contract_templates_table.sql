-- Migration script to create contract_templates table
-- Run this script in your PostgreSQL database

CREATE TABLE IF NOT EXISTS contract_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL,
    content TEXT,
    file_url TEXT,
    file_name TEXT,
    translation_part VARCHAR,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS template_type_idx ON contract_templates(type);
CREATE INDEX IF NOT EXISTS template_translation_part_idx ON contract_templates(translation_part);
CREATE INDEX IF NOT EXISTS template_is_default_idx ON contract_templates(is_default);

