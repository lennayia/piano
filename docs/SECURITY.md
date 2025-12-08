# Security Policy

## Copyright & Ownership

**Copyright (c) 2025 Lenka Roubalová. All rights reserved.**

This is proprietary software. Unauthorized use, copying, modification, or distribution is strictly prohibited.

---

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this application, please report it responsibly:

### How to Report

1. **DO NOT** create a public GitHub issue
2. **DO NOT** disclose the vulnerability publicly
3. **DO** email security details to: lenna@online-byznys.cz

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if available)

### Response Time

- We aim to acknowledge reports within **48 hours**
- We will provide updates on the fix timeline
- Credit will be given to responsible reporters (if desired)

---

## Security Best Practices

### For Developers

1. **Never commit sensitive data:**
   - API keys, tokens, passwords
   - Database credentials
   - Environment variables

2. **Always use `.env` files:**
   - Keep `.env` in `.gitignore`
   - Use `.env.example` for documentation
   - Rotate keys regularly

3. **Supabase Security:**
   - Row Level Security (RLS) enabled
   - Anon key is public (this is OK)
   - Service key must NEVER be exposed

4. **Dependencies:**
   - Run `npm audit` regularly
   - Update dependencies monthly
   - Review security advisories

### For Deployment

1. **Environment Variables:**
   - Set all required env vars in production
   - Never hardcode secrets
   - Use platform secret management

2. **HTTPS Only:**
   - Force HTTPS in production
   - Use secure cookies
   - Enable HSTS headers

3. **Access Control:**
   - Implement proper authentication
   - Use Supabase RLS policies
   - Validate all user input

---

## Known Security Measures

✅ **Implemented:**
- Environment variable protection
- Supabase Row Level Security (RLS)
- Input validation on forms
- HTTPS enforcement
- Proprietary license protection

⚠️ **Recommendations:**
- Regular security audits
- Penetration testing
- Code obfuscation for production
- Rate limiting on API endpoints
- CAPTCHA for registration

---

## Compliance

This application handles:
- User personal data (names, emails)
- Learning progress data
- User-generated content

### GDPR Compliance (if applicable)

- Users can request data deletion
- Privacy policy should be implemented
- Cookie consent mechanism
- Data retention policies

---

## License Violations

Unauthorized use of this software may result in:
- Civil penalties
- Criminal prosecution
- Immediate termination of access
- Legal action for damages

For licensing inquiries: lenna@online-byznys.cz

---

## Security Updates

This document is maintained and updated regularly.
Last Updated: November 20, 2025
