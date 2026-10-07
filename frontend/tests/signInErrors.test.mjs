import assert from 'node:assert/strict';
import test from 'node:test';
import { formatSignInError, safeSignInErrorCode, SIGN_IN_MESSAGES } from '../src/utils/signInErrors.ts';

const failure = (status, data) => ({ response: { status, data } });

test('unexpected failures never expose server bodies or exception text', () => {
  for (const error of [
    failure(500, { message: 'SQLSTATE error at /server/auth.php', trace: ['secret'] }),
    failure(500, { message: SIGN_IN_MESSAGES.invalid_credentials }),
    failure(502, '<html>Stack trace: secret</html>'),
    failure(400, { message: 'Unexpected internal exception' }),
    failure(403, { errors: { login: ['Stack trace: secret'] } }),
    failure(500, null),
    failure('422', { message: SIGN_IN_MESSAGES.inactive }),
    new Error('Stack trace: secret'),
    null,
    'raw exception',
  ]) {
    assert.equal(formatSignInError(error).message, SIGN_IN_MESSAGES.sign_in_failed);
  }
});

test('known authentication and validation feedback uses local copy', () => {
  for (const code of ['invalid_credentials', 'inactive', 'link_expired', 'account_unavailable']) {
    assert.equal(formatSignInError(failure(422, { message: SIGN_IN_MESSAGES[code] })).code, code);
  }
  assert.equal(formatSignInError(failure(422, {
    errors: { login: ['The login field is required.'] },
  })).code, 'login_required');
  assert.equal(formatSignInError(failure(422, {
    errors: { password: 'The password field is required.' },
  })).code, 'password_required');
  assert.equal(formatSignInError(failure(422, {
    message: 'Stack trace: secret', errors: { login: [{ secret: true }] },
  })).code, 'invalid_details');
  assert.equal(formatSignInError(failure(419, {})).code, 'session_expired');
});

test('lockout countdown accepts only finite positive numbers', () => {
  assert.equal(formatSignInError(failure(429, { retry_after: 10 })).retryAfter, 10);
  assert.equal(formatSignInError(failure(429, { retry_after: 1.5 })).retryAfter, 2);
  for (const retry_after of [0, -1, Infinity, NaN, '10', {}, null]) {
    const result = formatSignInError(failure(429, { retry_after, message: 'secret' }));
    assert.equal(result.code, 'rate_limited');
    assert.equal(result.retryAfter, undefined);
  }
});

test('network and timeout errors have actionable, safe messages', () => {
  for (const code of ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT']) {
    assert.equal(formatSignInError({ code, message: 'internal URL' }).code, 'network_error');
  }
});

test('OAuth redirects accept only known codes, including prototype-like inputs', () => {
  for (const code of ['no_account', 'inactive', 'google_email', 'link_expired', 'network_error']) {
    assert.equal(safeSignInErrorCode(code), code);
  }
  for (const value of ['Stack trace: secret', '<html>Error</html>', 'toString', '__proto__', '', null]) {
    assert.equal(safeSignInErrorCode(value), 'google_failed');
  }
});
