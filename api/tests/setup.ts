import { getPool } from '../src/db/postgres';
import fs from 'fs';
import path from 'path';

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

  const pool = getPool();

  // Create additional tables for auth
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
      label TEXT,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Read and execute init.sql to set up schema
  const initSql = fs.readFileSync(path.join(__dirname, '../../sql/init.sql'), 'utf-8');
  await pool.query(initSql);
});

afterAll(async () => {
  const pool = getPool();
  await pool.end();
});

afterEach(async () => {
  // Clean up data after each test
  const pool = getPool();
  await pool.query('DELETE FROM detalles_venta');
  await pool.query('DELETE FROM ventas');
  await pool.query('DELETE FROM productos');
  await pool.query('DELETE FROM proveedores');
  await pool.query('DELETE FROM clientes');
  await pool.query('DELETE FROM accounts');
  await pool.query('DELETE FROM users');
});