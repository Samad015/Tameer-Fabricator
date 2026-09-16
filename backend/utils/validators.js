// Centralised input validation for registration and auth flows.
// Kept dependency-free so it works identically on any deployment.

// Common disposable / throwaway email providers. Blocking these stops the
// bulk of fake signups without needing a paid verification API.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'guerrillamail.net',
  'sharklasers.com', 'grr.la', '10minutemail.com', '10minutemail.net',
  'tempmail.com', 'temp-mail.org', 'tempmailo.com', 'throwawaymail.com',
  'trashmail.com', 'trashmail.net', 'getnada.com', 'nada.email',
  'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'mailnesia.com',
  'mytemp.email', 'emailondeck.com', 'spamgourmet.com', 'mohmal.com',
  'moakt.com', 'tempr.email', 'discard.email', 'burnermail.io',
  'anonaddy.com', 'mailsac.com', 'inboxkitten.com', 'tempmailaddress.com',
  'email-temp.com', 'luxusmail.org', 'vomoto.com', 'byom.de'
]);

/**
 * Validates an email address.
 * Checks RFC-ish format, length limits, and blocks disposable providers.
 */
const validateEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }

  const email = rawEmail.trim().toLowerCase();

  if (email.length > 254) {
    return { valid: false, message: 'Email address is too long.' };
  }

  // Standard practical email pattern: local@domain.tld
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailPattern.test(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  // Reject consecutive dots and leading/trailing dots in the local part
  const [localPart] = email.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  const domain = email.split('@')[1];

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, message: 'Temporary or disposable email addresses are not allowed. Please use a permanent email.' };
  }

  // TLD must be at least 2 characters and alphabetic
  const tld = domain.split('.').pop();
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  return { valid: true, value: email };
};

/**
 * Validates an Indian mobile number.
 * Accepts formats with or without +91 / 0 prefix, spaces, or dashes.
 * Returns the normalised 10-digit number.
 */
const validatePhone = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, message: 'Mobile number is required.' };
  }

  // Strip everything except digits
  let digits = rawPhone.replace(/\D/g, '');

  // Remove country code / trunk prefix if present
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length === 13 && digits.startsWith('091')) {
    digits = digits.slice(3);
  }

  if (digits.length !== 10) {
    return { valid: false, message: 'Mobile number must be exactly 10 digits.' };
  }

  // Indian mobile numbers start with 6, 7, 8 or 9
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { valid: false, message: 'Please enter a valid Indian mobile number (must start with 6, 7, 8 or 9).' };
  }

  // Reject obviously fake numbers like 9999999999 or 1234567890 patterns
  if (/^(\d)\1{9}$/.test(digits)) {
    return { valid: false, message: 'Please enter a real mobile number.' };
  }

  return { valid: true, value: digits };
};

/**
 * Validates password strength.
 * Requires: 8+ chars, uppercase, lowercase, number, special character.
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 72) {
    return { valid: false, message: 'Password must be under 72 characters.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. @ # $ !).' };
  }

  // Block the most common weak passwords outright
  const weakPasswords = ['password', 'password1', 'password@1', 'admin@123', 'qwerty123', 'welcome@1', 'india@123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: 'This password is too common. Please choose a stronger one.' };
  }

  return { valid: true };
};

/**
 * Validates a person or business name.
 */
const validateName = (rawName, fieldLabel = 'Name') => {
  if (!rawName || typeof rawName !== 'string') {
    return { valid: false, message: `${fieldLabel} is required.` };
  }

  const name = rawName.trim().replace(/\s+/g, ' ');

  if (name.length < 2) {
    return { valid: false, message: `${fieldLabel} must be at least 2 characters.` };
  }

  if (name.length > 100) {
    return { valid: false, message: `${fieldLabel} is too long.` };
  }

  // Letters, spaces, and common business punctuation only
  if (!/^[a-zA-Z0-9\s.,'&()-]+$/.test(name)) {
    return { valid: false, message: `${fieldLabel} contains invalid characters.` };
  }

  // Must contain at least one letter (reject "123" or "...")
  if (!/[a-zA-Z]/.test(name)) {
    return { valid: false, message: `Please enter a valid ${fieldLabel.toLowerCase()}.` };
  }

  return { valid: true, value: name };
};

/**
 * Checks whether the email's domain actually has mail servers (MX records).
 * This catches typo'd or non-existent domains (e.g. "gnail.com",
 * "asdasd123.com") without needing any paid API - uses Node's built-in
 * DNS resolver. It CANNOT confirm whether a specific mailbox (e.g. a
 * random username @gmail.com) actually exists - only a real send +
 * OTP confirmation (already enforced elsewhere) can do that.
 */
const verifyDomainHasMailServer = (email) => {
  return new Promise((resolve) => {
    const dns = require('dns');
    const domain = email.split('@')[1];

    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  verifyDomainHasMailServer,
  DISPOSABLE_EMAIL_DOMAINS
};