#!/usr/bin/env node

/**
 * PostgreSQL Setup Helper
 * Helps find correct credentials for local PostgreSQL instance
 */

const { Pool } = require('pg');

const connectionStrings = [
  'postgresql://postgres:ecodistrict@localhost:5432/ecodistrict_dev',
  'postgresql://postgres@localhost:5432/postgres',
  'postgresql://postgres:postgres@localhost:5432/postgres',
  'postgresql://localhost/postgres',
  'postgresql://host.docker.internal/postgres',
];

async function testConnection(connectionString) {
  try {
    console.log(`\nTesting: ${connectionString}`);
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    const result = await pool.query('SELECT NOW()');
    console.log(`✓ SUCCESS! Connected at: ${new Date(result.rows[0].now).toISOString()}`);
    await pool.end();
    return connectionString;
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    return null;
  }
}

async function findConnection() {
  console.log('🔍 PostgreSQL Connection Tester\n');
  console.log('Testing common connection strings...');

  for (const connString of connectionStrings) {
    const result = await testConnection(connString);
    if (result) {
      console.log(`\n✅ Found working connection: ${result}`);
      console.log('\nUpdate your .env file with:');
      console.log(`DATABASE_URL=${result}`);
      return;
    }
  }

  console.log('\n❌ Could not find a working PostgreSQL connection.');
  console.log('\nManual setup:');
  console.log('1. Check PostgreSQL is running: pg_isready');
  console.log('2. Test connection: psql -U postgres');
  console.log('3. Update .env with your connection details');
}

findConnection().catch(console.error);
