import test from 'node:test';
import assert from 'node:assert';
import {
  registerUser,
  authenticateUser,
  createSession,
  getSessionUser,
  generateResetToken,
  resetPasswordWithToken,
  updateUserPlan,
  verifyPassword,
} from '../src/lib/auth';

test('TempLink Optional Authentication System', async (t) => {
  const testEmail = `tester_${Date.now()}@templink.test`;
  const testPassword = 'SecurePassword#123';
  const testName = 'Test User';

  let createdUserId = '';

  await t.test('1. Registers user with hashed password and default FREE plan', () => {
    const user = registerUser(testEmail, testPassword, testName);
    assert.ok(user.id.startsWith('usr_'));
    assert.strictEqual(user.email, testEmail.toLowerCase());
    assert.strictEqual(user.displayName, testName);
    assert.strictEqual(user.plan, 'FREE');
    createdUserId = user.id;
  });

  await t.test('2. Rejects duplicate registration with existing email', () => {
    assert.throws(() => {
      registerUser(testEmail, 'AnotherPass#123', 'Duplicate');
    }, /already exists/);
  });

  await t.test('3. Successfully authenticates user with correct password', () => {
    const user = authenticateUser(testEmail, testPassword);
    assert.strictEqual(user.id, createdUserId);
    assert.strictEqual(user.email, testEmail.toLowerCase());
  });

  await t.test('4. Rejects authentication with wrong password', () => {
    assert.throws(() => {
      authenticateUser(testEmail, 'WrongPassword#999');
    }, /Email or password is incorrect/);
  });

  await t.test('5. Creates and validates session token', () => {
    const sessionToken = createSession(createdUserId);
    assert.ok(sessionToken.startsWith('sess_'));

    const sessionUser = getSessionUser(sessionToken);
    assert.ok(sessionUser);
    assert.strictEqual(sessionUser?.id, createdUserId);
  });

  await t.test('6. Generates reset token and verifies password reset flow', () => {
    const resetToken = generateResetToken(testEmail);
    assert.ok(resetToken);
    assert.ok(resetToken.startsWith('rst_'));

    const newPassword = 'NewSecurePassword#456';
    const success = resetPasswordWithToken(resetToken, newPassword);
    assert.strictEqual(success, true);

    // Old password fails, new password succeeds
    assert.throws(() => {
      authenticateUser(testEmail, testPassword);
    }, /Email or password is incorrect/);

    const updatedUser = authenticateUser(testEmail, newPassword);
    assert.strictEqual(updatedUser.id, createdUserId);
  });

  await t.test('7. Updates user plan to PRO and BUSINESS', () => {
    const proUser = updateUserPlan(createdUserId, 'PRO');
    assert.strictEqual(proUser.plan, 'PRO');

    const bizUser = updateUserPlan(createdUserId, 'BUSINESS');
    assert.strictEqual(bizUser.plan, 'BUSINESS');
  });

  await t.test('8. Pre-seeded demo account alex@example.com is authenticatable', () => {
    const demoUser = authenticateUser('alex@example.com', 'ProSecure#2026');
    assert.strictEqual(demoUser.email, 'alex@example.com');
    assert.strictEqual(demoUser.plan, 'PRO');
  });
});
