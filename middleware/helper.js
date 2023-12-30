const crypto = require('crypto');

function generateUniqueID() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
  
    // Generate 3 random characters
    let randomChars = '';
    while (randomChars.length < 3) {
      const randomBytes = crypto.randomBytes(1);
      const index = randomBytes[0] % chars.length;
      randomChars += chars[index];
    }

        
    // Generate 3 random digits
    let randomDigits = '';
    while (randomDigits.length < 3) {
        const randomBytes = crypto.randomBytes(1);
        const index = randomBytes[0] % digits.length;
        randomDigits += digits[index];
    }

    return randomDigits + randomChars;
}

module.exports = {
    generateUniqueID
}