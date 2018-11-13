/**
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');

// Container for all the helpers
const helpers = {};

// Converting JSON into an object without throwing error
helpers.parseJSONtoObject = str => {
    try {
        return JSON.parse(str);
    } catch(e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = str => {
    if (typeof str == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Generating a random string
helpers.createRandomString = strLength => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < strLength; i++) {
        const charIndex = Math.floor(Math.random() * chars.length);
        str += chars[charIndex];
    }
    return str;
}

// Exporting helpers
module.exports = helpers;
