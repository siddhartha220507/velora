// utils/crypto.js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// .env se key utha kar Buffer (computer memory format) mein convert kar rahe hain
const getMasterKey = () => Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (plainText) => {
    // 16-byte ka random IV (Initialization Vector)
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(algorithm, getMasterKey(), iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return {
        encryptedValue: encrypted,
        iv: iv.toString('base64')
    };
};

const decrypt = (encryptedValue, ivBase64) => {
    try {
        const iv = Buffer.from(ivBase64, 'base64');
        const decipher = crypto.createDecipheriv(algorithm, getMasterKey(), iv);
        
        let decrypted = decipher.update(encryptedValue, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error("Decryption failed. Data might be corrupted or key is wrong.");
        return null;
    }
};

module.exports = { encrypt, decrypt };