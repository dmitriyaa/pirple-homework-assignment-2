/**
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

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

// Create a stripe charge to user
// @TODO: add input validation
// @TODO: beautify, and put auth key in config
helpers.payWithStripe = (amount, currency, source, description, callback) => {
    const payload = {
        amount,
        currency,
        source,
        description
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'path': '/v1/charges',
        'auth': '',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
        }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, res => {
        // Grab the status of the sent request
        const status = res.statusCode;

        // Callback successfully if the request went throught
        if (status === 200 || status == 201) {
            callback(false);
        } else {
            callback('status code returned was ' + status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', err => {
        callback(err);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end;

};

// Exporting helpers
module.exports = helpers;
