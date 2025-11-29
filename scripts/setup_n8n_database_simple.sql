-- ============================================================================
-- N8N DATABASE SETUP - PART 1 (Run on default database)
-- ============================================================================
-- Run this first in pgAdmin connected to postgres database

-- Create N8N database
CREATE DATABASE n8n_database 
  WITH ENCODING 'UTF8' 
  TEMPLATE template0;

-- Create N8N user
CREATE USER n8n_user WITH PASSWORD 'n8n_secure_password_2024';

-- Grant permissions to N8N database
GRANT ALL PRIVILEGES ON DATABASE n8n_database TO n8n_user;

-- Grant connection permission to translation_db
GRANT CONNECT ON DATABASE translation_db TO n8n_user;

-- Verify databases exist
SELECT datname FROM pg_database WHERE datname IN ('n8n_database', 'translation_db');
