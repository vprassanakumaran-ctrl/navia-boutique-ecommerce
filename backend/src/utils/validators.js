// Pure functions, no dependencies — used by routes/auth.js for the
// "email format", "password length", and "required field" validations
// specified in the requirement analysis.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isValidPassword(password) {
    // Spec only requires "at least 8 characters" — deliberately not adding
    // complexity rules (uppercase/symbol/etc.) that weren't asked for.
    return typeof password === 'string' && password.length >= 8;
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

module.exports = { isValidEmail, isValidPassword, isNonEmptyString };
