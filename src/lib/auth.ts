import crypto from 'crypto';
import { User, UserPlan } from '@/types';

// In-Memory User & Session Store (Edge / Server runtime)
interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  plan: UserPlan;
  createdAt: number;
  emailVerified: boolean;
}

interface ResetTokenData {
  email: string;
  expiresAt: number;
}

// Global in-memory maps to persist across hot reloads in Next.js development/production
const globalAuth = global as unknown as {
  __templink_users?: Map<string, StoredUser>;
  __templink_sessions?: Map<string, { userId: string; expiresAt: number }>;
  __templink_reset_tokens?: Map<string, ResetTokenData>;
};

if (!globalAuth.__templink_users) {
  globalAuth.__templink_users = new Map();
  globalAuth.__templink_sessions = new Map();
  globalAuth.__templink_reset_tokens = new Map();

  // Seed default Demo Pro Account for presentation & testing
  const seedSalt = crypto.randomBytes(16).toString('hex');
  const seedHash = crypto.pbkdf2Sync('ProSecure#2026', seedSalt, 100000, 64, 'sha512').toString('hex');

  globalAuth.__templink_users.set('alex@example.com', {
    id: 'user_alex_pro_2026',
    email: 'alex@example.com',
    displayName: 'Alex Rivers',
    passwordHash: seedHash,
    salt: seedSalt,
    plan: 'PRO',
    createdAt: Date.now() - 86400000 * 30,
    emailVerified: true,
  });
}

const usersMap = globalAuth.__templink_users!;
const sessionsMap = globalAuth.__templink_sessions!;
const resetTokensMap = globalAuth.__templink_reset_tokens!;

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

export function registerUser(email: string, password: string, displayName: string): User {
  const normalizedEmail = email.trim().toLowerCase();

  if (usersMap.has(normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const { hash, salt } = hashPassword(password);
  const id = 'usr_' + crypto.randomBytes(8).toString('hex');

  const newUser: StoredUser = {
    id,
    email: normalizedEmail,
    displayName: displayName.trim() || 'Anonymous User',
    passwordHash: hash,
    salt,
    plan: 'FREE',
    createdAt: Date.now(),
    emailVerified: true,
  };

  usersMap.set(normalizedEmail, newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    displayName: newUser.displayName,
    plan: newUser.plan,
    createdAt: newUser.createdAt,
    emailVerified: newUser.emailVerified,
  };
}

export function authenticateUser(email: string, password: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersMap.get(normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    throw new Error('Email or password is incorrect.');
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    plan: user.plan,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
  };
}

export function createSession(userId: string): string {
  const sessionToken = 'sess_' + crypto.randomBytes(32).toString('hex');
  // 30 days expiration
  sessionsMap.set(sessionToken, {
    userId,
    expiresAt: Date.now() + 86400000 * 30,
  });
  return sessionToken;
}

export function getSessionUser(sessionToken: string): User | null {
  if (!sessionToken) return null;
  const session = sessionsMap.get(sessionToken);
  if (!session || Date.now() > session.expiresAt) {
    if (session) sessionsMap.delete(sessionToken);
    return null;
  }

  for (const user of usersMap.values()) {
    if (user.id === session.userId) {
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: user.plan,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      };
    }
  }

  return null;
}

export function destroySession(sessionToken: string): void {
  if (sessionToken) {
    sessionsMap.delete(sessionToken);
  }
}

export function generateResetToken(email: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!usersMap.has(normalizedEmail)) {
    return null;
  }

  const resetToken = 'rst_' + crypto.randomBytes(24).toString('hex');
  // 15 minutes expiration
  resetTokensMap.set(resetToken, {
    email: normalizedEmail,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return resetToken;
}

export function resetPasswordWithToken(token: string, newPassword: string): boolean {
  const resetData = resetTokensMap.get(token);
  if (!resetData || Date.now() > resetData.expiresAt) {
    if (resetData) resetTokensMap.delete(token);
    throw new Error('This password reset link is invalid or has expired.');
  }

  const user = usersMap.get(resetData.email);
  if (!user) {
    throw new Error('Account not found.');
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;

  resetTokensMap.delete(token);
  return true;
}

export function updateUserPlan(userId: string, newPlan: UserPlan): User {
  for (const user of usersMap.values()) {
    if (user.id === userId) {
      user.plan = newPlan;
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: user.plan,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      };
    }
  }
  throw new Error('User not found.');
}
