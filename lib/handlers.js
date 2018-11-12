/**
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Container for all handlers
const handlers = {};

// Users router
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.includes(data.method)) {
        // Routing to the correct handler after method validation
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for the users sub handlers
handlers._users = {};

// Users - post (create a new user)
// Required data: name, email, passwrod, street address
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    const name = typeof data.payload.name == 'string'
        && data.payload.name.trim().length > 0
            ? data.payload.name : false;
    const email = typeof data.payload.email == 'string'
        && data.payload.email.trim().length > 0
            ? data.payload.email : false;
    const password = typeof data.payload.password == 'string'
        && data.payload.password.trim().length > 0
            ? data.payload.password : false;
    const streetAddress = typeof data.payload.streetAddress == 'string'
        && data.payload.streetAddress.trim().length > 0
            ? data.payload.streetAddress : false;

    if (name && email && password && streetAddress) {
        // Make sure that the user doesn't already exist
        _data.read('users', email, err => {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    const userObject = {
                        name,
                        email,
                        hashedPassword,
                        streetAddress
                    };

                    // Store the user
                    _data.create('users', email, userObject, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not create a user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not create a user'});
                }
            } else {
                callback(400, {'Error': 'Could not create account because the user already exists'});
            }
        });
    } else {
        callback(400, {'Error': 'Midding required fields'});
    }

}

// Users - put (udpate a user)
// Required data: email
// Optional data: name, password, street
// @TODO: add token validation
handlers._psers.put = (data, callback) => {
    // Required data validation
    const email = typeof data.payload.email == 'string'
        && data.payload.email.trim().length > 0
            ? data.payload.email : false;

    // Optional data validation
    const name = typeof data.payload.name == 'string'
        && data.payload.name.trim().length > 0
            ? data.payload.name : false;
    const password = typeof data.payload.password == 'string'
        && data.payload.password.trim().length > 0
            ? data.payload.password : false;
    const streetAddress = typeof data.payload.streetAddress == 'string'
        && data.payload.streetAddress.trim().length > 0
            ? data.payload.streetAddress : false;

    if (email) {
        if (name || password || streetAddress) {

        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}

// Simple ping handler, that checks if the server is up
handlers.ping = (data, callback) => {
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Exporting handlers
module.exports = handlers;
