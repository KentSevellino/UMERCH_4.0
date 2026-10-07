import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { authStatus, protectedDestination } from '../src/utils/authState.ts';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../src');
let auth;

// Render the real components with a supplied auth context and inert routing.
// Transpile in memory so this test needs no additional bundler or DOM dependency.
function component(relative) {
  const file = path.resolve(root, relative);
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env', '{}');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: file,
  });
  const module = { exports: {} };
  const load = (name) => {
    if (name.includes('contexts/AuthContext')) return { useAuth: () => auth };
    if (name === 'react-router-dom') return {
      Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
      Navigate: ({ to }) => React.createElement('span', { 'data-redirect': to }),
      useLocation: () => ({ pathname: '/Landing' }),
      useNavigate: () => () => {},
    };
    if (/\.(svg|jpg|png)$/.test(name)) return name;
    if (name.endsWith('/services/api')) return { default: {} , __esModule: true };
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(file), name);
      const extension = ['.tsx', '.ts'].find(ext => fs.existsSync(target + ext));
      return component(path.relative(root, target + extension));
    }
    return require(name);
  };
  new Function('require', 'module', 'exports', outputText)(load, module, module.exports);
  return module.exports;
}

function setStatus(status, admin = false) {
  auth = {
    status, isLoading: status === 'loading', isPendingVerification: status === 'pending',
    isAuthenticated: status === 'verified', isAdmin: status === 'verified' && admin,
    otpVerified: status === 'verified', user: status === 'guest' ? null : { user_fullname: 'Pending Person', email: 'test@example.com' },
    logout: async () => {}, verifyOtp: async () => {}, resendOtp: async () => {},
  };
}

const render = (file, props = {}) => renderToStaticMarkup(React.createElement(component(file).default, props));

test('credentials alone never produce verified authentication and reload begins unresolved', () => {
  assert.equal(authStatus(true, true, false, false), 'pending');
  assert.equal(authStatus(true, true, true, true), 'loading');
  assert.equal(authStatus(false, false, true, false), 'guest');
  assert.equal(authStatus(true, true, true, false), 'verified');
  assert.equal(protectedDestination('pending', true, false), '/authentication');
});

test('pending landing navigation shows resume/cancel without account or protected links', () => {
  setStatus('pending');
  const html = render('components/layouts/LandingNav.tsx');
  assert.match(html, /Complete verification/);
  assert.match(html, /Cancel sign-in/);
  assert.match(html, /href="\/authentication"/);
  assert.doesNotMatch(html, /Pending Person|href="\/(Cart|Orders|Shop)"|>SIGN IN</);
});

test('guest and verified navigation remain distinct', () => {
  setStatus('guest');
  const guest = render('components/layouts/LandingNav.tsx');
  assert.match(guest, /SIGN IN/);
  assert.match(guest, /<button[^>]*>SIGN IN<\/button>/);
  assert.doesNotMatch(guest, /href="\/login"/);
  assert.doesNotMatch(guest, /Complete verification|Cancel sign-in/);
  setStatus('verified');
  const verified = render('components/layouts/LandingNav.tsx');
  assert.match(verified, /Pending Person/);
  assert.match(verified, /href="\/Orders"/);
  assert.doesNotMatch(verified, /Complete verification|Cancel sign-in/);
});

test('pending normal and admin guards redirect to verification without rendering protected content', () => {
  for (const guard of ['AuthGuard', 'AdminGuard']) {
    setStatus('pending');
    const html = render(`components/guards/${guard}.tsx`, { children: 'private-content' });
    assert.match(html, /data-redirect="\/authentication"/);
    assert.doesNotMatch(html, /private-content/);
  }
});

test('verification is resumable while pending and redirects guests and verified users', () => {
  setStatus('pending');
  assert.match(render('Pages/AuthenticationPage.tsx'), /Cancel sign-in/);
  setStatus('guest');
  assert.match(render('Pages/AuthenticationPage.tsx'), /data-redirect="\/login"/);
  setStatus('verified', true);
  assert.match(render('Pages/AuthenticationPage.tsx'), /data-redirect="\/admin"/);
});
