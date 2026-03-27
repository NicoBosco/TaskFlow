import pool from '../config/db';
import bcrypt from 'bcryptjs';
import { User, RegisterPayload, LoginPayload } from '../types';

export async function registerUser(
  payload: RegisterPayload
): Promise<User> {
  const { name, email, password } = payload;

  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    throw new Error('EMAIL_TAKEN');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name.trim(), email.toLowerCase(), password_hash]
  );

  return result.rows[0];
}

export async function loginUser(
  payload: LoginPayload
): Promise<User | null> {
  const { email, password } = payload;

  const result = await pool.query<User & { password_hash: string }>(
    'SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  const user = result.rows[0];
  
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  
  if (!passwordMatches) return null;

  const { password_hash: _skipped, ...safeUser } = user;
  return safeUser as User;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function updateUserProfile(
  id: number,
  payload: { name?: string; role?: string }
): Promise<User> {
  const { name, role } = payload;
  
  const result = await pool.query<User>(
    `UPDATE users 
     SET name = COALESCE($1, name), 
         role = COALESCE($2, role)
     WHERE id = $3
     RETURNING id, name, email, role, created_at`,
    [name, role, id]
  );

  return result.rows[0];
}
