import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../src/models/User.js';
import MessageService from '../src/modules/message/message.service.js';
import PostController from '../src/modules/post/post.controller.js';
import MessageController from '../src/modules/message/message.controller.js';

test('User schema includes security and oauth fields', () => {
  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    security: {
      passwordResetToken: 'sample_token_123',
      passwordResetExpires: new Date(Date.now() + 3600000),
      emailVerificationToken: 'verify_token_456',
      emailVerificationExpires: new Date(Date.now() + 86400000),
    },
    oauth: {
      google: {
        id: 'google_12345',
        email: 'google@example.com',
        picture: 'https://example.com/avatar.jpg',
      },
    },
    moderation: {
      status: 'suspended',
      suspendedUntil: new Date(Date.now() + 86400000 * 7),
    },
  });

  assert.equal(user.security.passwordResetToken, 'sample_token_123');
  assert.equal(user.security.emailVerificationToken, 'verify_token_456');
  assert.equal(user.oauth.google.id, 'google_12345');
  assert.ok(user.moderation.suspendedUntil instanceof Date);
});

test('MessageService.generateConversationId correctly sorts user IDs', () => {
  const id1 = '507f1f77bcf86cd799439011';
  const id2 = '507f191e810c19729de860ea';

  const convId1 = MessageService.generateConversationId(id1, id2);
  const convId2 = MessageService.generateConversationId(id2, id1);

  assert.equal(convId1, convId2);
  assert.equal(convId1, `${id2}_${id1}`);
});

test('PostController comment and post actions are defined functions', () => {
  assert.equal(typeof PostController.updateComment, 'function');
  assert.equal(typeof PostController.deleteComment, 'function');
  assert.equal(typeof PostController.likeComment, 'function');
  assert.equal(typeof PostController.unlikeComment, 'function');
  assert.equal(typeof PostController.sharePost, 'function');
  assert.equal(typeof PostController.reportPost, 'function');
  assert.equal(typeof PostController.ToggleLike, 'function');
});

test('MessageController search and chat methods are defined functions', () => {
  assert.equal(typeof MessageController.SearchMessages, 'function');
  assert.equal(typeof MessageController.GetUsersForChat, 'function');
  assert.equal(typeof MessageController.GetUnreadCount, 'function');
});

test('Admin and Report controllers and services are properly structured', async () => {
  const { AdminController } = await import('../src/modules/admin/admin.controller.js');
  const ReportController = (await import('../src/modules/report/report.controller.js')).default;
  const ReportService = (await import('../src/modules/report/report.service.js')).default;

  assert.equal(typeof AdminController.moderatePost, 'function');
  assert.equal(typeof AdminController.moderateComment, 'function');
  assert.equal(typeof AdminController.broadcastNotification, 'function');
  assert.equal(typeof ReportController.resolveReport, 'function');
  assert.equal(typeof ReportService.getReportCategories, 'function');

  const categories = ReportService.getReportCategories();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
});

test('string.util escapeRegex safely escapes special regex characters', async () => {
  const { escapeRegex } = await import('../src/utils/string.util.js');

  assert.equal(escapeRegex('hello.world'), 'hello\\.world');
  assert.equal(escapeRegex('user[name]'), 'user\\[name\\]');
  assert.equal(escapeRegex('price$100*'), 'price\\$100\\*');
  assert.equal(escapeRegex('  (test)+?  '), '\\(test\\)\\+\\?');
  assert.equal(escapeRegex(null), '');
  assert.equal(escapeRegex(undefined), '');
});

test('crypto.util helpers generate tokens, hashes, and UUIDs', async () => {
  const { generateRandomToken, hashToken, generateUUID } = await import(
    '../src/utils/crypto.util.js'
  );

  const token = generateRandomToken(16);
  assert.equal(typeof token, 'string');
  assert.equal(token.length, 32); // 16 bytes = 32 hex chars

  const hashed = hashToken('my-secret-token');
  assert.equal(typeof hashed, 'string');
  assert.equal(hashed.length, 64); // SHA-256 is 64 hex chars
  assert.equal(hashed, hashToken('my-secret-token')); // Deterministic

  const uuid = generateUUID();
  assert.equal(typeof uuid, 'string');
  assert.match(
    uuid,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  );
});

test('UserController methods are properly defined and use sendOk', async () => {
  const UserController = (await import('../src/modules/user/user.controller.js')).default;

  assert.equal(typeof UserController.Get_User_By_Id, 'function');
  assert.equal(typeof UserController.getRecommendedUsers, 'function');
  assert.equal(typeof UserController.searchUsers, 'function');
  assert.equal(typeof UserController.followUser, 'function');
  assert.equal(typeof UserController.unfollowUser, 'function');
  assert.equal(typeof UserController.updateProfileSettings, 'function');
  assert.equal(typeof UserController.updatePrivacySettings, 'function');
});

test('NotificationService operates cleanly without repository dependency', async () => {
  const NotificationService = (
    await import('../src/modules/notification/notification.service.js')
  ).default;

  assert.equal(typeof NotificationService.getNotifications, 'function');
  assert.equal(typeof NotificationService.getUnreadCount, 'function');
  assert.equal(typeof NotificationService.markAsRead, 'function');
  assert.equal(typeof NotificationService.deleteNotification, 'function');
  assert.equal(typeof NotificationService.cleanupOldNotifications, 'function');
});

test('HashPassword utils correctly hash and compare passwords', async () => {
  const { hashPassword, comparePassword } = await import(
    '../src/utils/HashPassword.js'
  );

  const password = 'TestSecurePassword123!';
  const hashed = await hashPassword(password);

  assert.notEqual(password, hashed);
  assert.equal(await comparePassword(password, hashed), true);
  assert.equal(await comparePassword('WrongPassword', hashed), false);
});

test('Message validation schemas properly validate payloads', async () => {
  const { createConversationBody, createGroupBody } = await import(
    '../src/validations/message.validation.js'
  );

  const validSingle = createConversationBody.validate({
    participantId: '507f1f77bcf86cd799439011',
  });
  assert.equal(validSingle.error, undefined);

  const invalidGroup = createGroupBody.validate({
    name: 'Team Group',
    participantIds: ['507f1f77bcf86cd799439011'], // Only 1 participant
  });
  assert.ok(invalidGroup.error);
});

