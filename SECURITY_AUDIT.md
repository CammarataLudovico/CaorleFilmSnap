# Security Audit - Dependency Vulnerabilities

**Date:** 2026-02-03  
**Repository:** CaorleFilmSnap

## Summary

A comprehensive security audit was conducted on all project dependencies. Multiple vulnerabilities were identified and successfully resolved.

## Vulnerabilities Found and Fixed

### Root Package Dependencies

#### 1. **multer** (Critical)
- **Initial Version:** 2.0.0
- **Fixed Version:** 2.0.2
- **Vulnerabilities:**
  - Denial of Service via unhandled exception from malformed request
  - Denial of Service via unhandled exception
- **Severity:** High
- **Action:** Updated to patched version 2.0.2

#### 2. **body-parser**
- **Initial Version:** Vulnerable transitive dependency
- **Fixed Version:** 2.2.2
- **Vulnerability:** Denial of Service when URL encoding is used
- **Severity:** Moderate
- **Action:** Auto-fixed via npm audit fix

#### 3. **qs**
- **Initial Version:** < 6.14.1
- **Fixed Version:** 6.14.1
- **Vulnerability:** arrayLimit bypass allows DoS via memory exhaustion
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 4. **jws**
- **Initial Version:** 4.0.0
- **Fixed Version:** 4.0.1
- **Vulnerability:** Improperly Verifies HMAC Signature
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 5. **lodash**
- **Initial Version:** 4.0.0 - 4.17.21
- **Fixed Version:** 4.17.23
- **Vulnerability:** Prototype Pollution in `_.unset` and `_.omit` functions
- **Severity:** Moderate
- **Action:** Auto-fixed via npm audit fix

#### 6. **react-router-dom**
- **Initial Version:** 7.8.2
- **Fixed Version:** 7.13.0
- **Vulnerabilities:**
  - CSRF issue in Action/Server Action Request Processing
  - XSS via Open Redirects
  - SSR XSS in ScrollRestoration
  - Unexpected external redirect via untrusted paths
  - XSS Vulnerability
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 7. **tar-fs**
- **Initial Version:** 2.0.0 - 2.1.3
- **Fixed Version:** 2.1.4
- **Vulnerability:** Symlink validation bypass with predictable destination directory
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 8. **tar** (Transitive Dependency)
- **Initial Version:** <= 7.5.6
- **Fixed Version:** 7.5.7
- **Vulnerabilities:**
  - Arbitrary File Overwrite and Symlink Poisoning
  - Race Condition in Path Reservations
  - Arbitrary File Creation/Overwrite via Hardlink Path Traversal
- **Severity:** High
- **Action:** Added npm override to force version 7.5.7

### Frontend Package Dependencies

#### 1. **@eslint/plugin-kit**
- **Initial Version:** < 0.3.4
- **Fixed Version:** >= 0.3.4
- **Vulnerability:** Regular Expression Denial of Service attacks through ConfigCommentParser
- **Severity:** Low
- **Action:** Auto-fixed via npm audit fix

#### 2. **js-yaml**
- **Initial Version:** 4.0.0 - 4.1.0
- **Fixed Version:** 4.1.1
- **Vulnerability:** Prototype pollution in merge (<<)
- **Severity:** Moderate
- **Action:** Auto-fixed via npm audit fix

#### 3. **react-router-dom** (Frontend)
- **Initial Version:** 7.8.2
- **Fixed Version:** Updated via npm audit fix
- **Vulnerabilities:** Same as root package
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 4. **tar** (Frontend Transitive)
- **Initial Version:** <= 7.5.6
- **Fixed Version:** 7.5.7
- **Vulnerabilities:** Same as root package
- **Severity:** High
- **Action:** Auto-fixed via npm audit fix

#### 5. **vite**
- **Initial Version:** 6.3.5
- **Fixed Version:** 6.4.1
- **Vulnerabilities:**
  - Middleware may serve files starting with same name as public directory
  - `server.fs` settings not applied to HTML files
  - `server.fs.deny` bypass via backslash on Windows
- **Severity:** Moderate
- **Action:** Auto-fixed via npm audit fix

## Changes Made

1. **Updated package.json:**
   - Changed `multer` from `^2.0.0` to `^2.0.2`
   - Added `overrides` section to force `tar` version `^7.5.7`

2. **Ran `npm audit fix`** on root package to automatically fix other vulnerabilities

3. **Ran `npm audit fix`** on frontend package to automatically fix frontend vulnerabilities

4. **Updated lock files:**
   - `/package-lock.json`
   - `/src/frontend/package-lock.json`

## Verification

After applying all fixes:
- **Root package:** ✅ `npm audit` reports 0 vulnerabilities
- **Frontend package:** ✅ `npm audit` reports 0 vulnerabilities

## Recommendations

1. **Regular Security Audits:** Run `npm audit` regularly (e.g., weekly or before each release)
2. **Automated Monitoring:** Consider using tools like Dependabot or Snyk for automated vulnerability monitoring
3. **Keep Dependencies Updated:** Regularly update dependencies to get security patches
4. **Review Breaking Changes:** When updating major versions, review changelogs for breaking changes

## Notes

- All vulnerability fixes have been tested and verified
- No breaking changes were introduced
- Application functionality remains intact
