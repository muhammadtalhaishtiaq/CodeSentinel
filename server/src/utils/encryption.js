const crypto = require('crypto');

/**
 * Token Encryption Utility
 * Uses AES-256-GCM for secure token storage
 */

// Generate encryption key from JWT_SECRET (32 bytes for AES-256)
const ENCRYPTION_KEY = crypto
    .createHash('sha256')
    .update(process.env.JWT_SECRET || 'fallback-secret-key')
    .digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a token
 * @param {string} text - Plain text token to encrypt
 * @returns {string} Encrypted token in format: iv:authTag:encryptedData
 */
const encrypt = (text) => {
    if (!text) return null;
    
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Return format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt token');
    }
};

/**
 * Decrypt a token
 * @param {string} encryptedText - Encrypted token in format: iv:authTag:encryptedData
 * @returns {string} Decrypted plain text token
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return null;
    
    try {
        const parts = encryptedText.split(':');
        
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted token format');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt token');
    }
};

module.exports = {
    encrypt,
    decrypt
};


