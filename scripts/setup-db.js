#!/usr/bin/env node
/**
 * Setup script để tạo database và push schema
 * Usage: node scripts/setup-db.js
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
function loadEnv() {
  try {
    const envContent = readFileSync(join(rootDir, '.env'), 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  const env = loadEnv();
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Extract database name from URL
  const dbNameMatch = dbUrl.match(/\/([^\/\?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : 'translation_db';

  console.log(`📦 Database: ${dbName}`);
  console.log(`🔗 Connection: ${dbUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    console.log('📊 Pushing database schema...');
    execSync('npm run db:push', {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
    console.log('✅ Database schema pushed successfully!\n');
  } catch (error) {
    console.error('❌ Error pushing schema:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. Database exists (create it manually if needed)');
    console.log('   3. Connection string is correct');
    process.exit(1);
  }

  console.log('✅ Database setup completed!');
}

setupDatabase().catch(console.error);

