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
};

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
};

// Users - get
// Required data: email,
// Optional data: none
handlers._users.get = (data, callback) => {
    const email = typeof data.queryStringObject.email == 'string'
        && data.queryStringObject.email.trim().length > 0
            ? data.queryStringObject.email : false;

    if (email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string'
            ? data.headers.token : false;
        // Verify taht the given token is valid for the email
        handlers._tokens.verifyToken(token, email, tokenIsValid => {
            if (tokenIsValid) {
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        delete userData.hashedPassword;
                        callback(200, userData);
                    } else {
                        callback(400, {'Error': 'Could not find a specified user'});
                    }
                });
            } else {
                callback(403, {'Error': 'Missing required token in header, or token invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// Users - put (udpate a user)
// Required data: email
// Optional data: name, password, street
handlers._users.put = (data, callback) => {
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
            const token = typeof data.headers.token == 'string'
                ? data.headers.token : false;

            handlers._tokens.verifyToken(token, email, tokenIsValid => {
                if (tokenIsValid) {
                    _data.read('users', email, (err, userData) => {
                        if (!err && userData) {
                            if (name) {
                                userData.name = name;
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }
                            if (streetAddress) {
                                userData.streetAddress = streetAddress;
                            }

                            // Update the data
                            _data.update('users', email, userData, err => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'Could not update the specified user'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The specified user does not exist'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Missing required token in header, or token is invalid'});
                }
            });
        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - delete (delete a user)
// Required data: email
// @TODO: delete associated orders
handlers._users.delete = (data, callback) => {
    // Check that email is valid
    const email = typeof data.payload.email == 'string'
        && data.payload.email.trim().length > 0
            ? data.payload.email : false;
    if (email) {
        const token = typeof data.headers.token == 'string'
            ? data.headers.token : false;

        handlers._tokens.verifyToken(token, email, tokenIsValid => {
            if (tokenIsValid) {
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        _data.delete('users', email, err => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Could not delete specified user'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'The user does not exist'});
                    }
                });
            } else {
                callback(400, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.includes(data.method)) {
        // Routing to the correct handler after method validation
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the tokens sub handlers
handlers._tokens = {};

// Tokens - post (create a new token)
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof data.payload.email == 'string'
        && data.payload.email.trim().length > 0
            ? data.payload.email : false;
    const password = typeof data.payload.password == 'string'
        && data.payload.password.trim().length > 0
            ? data.payload.password : false;

    if (email && password) {
        // Checking if user exists
        _data.read('users', email, (err, userData) => {
            if (!err && userData) {
                // Checking if the password is correct
                if (userData.hashedPassword == helpers.hash(password)) {
                    // Generating token
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        email,
                        'id': tokenId,
                        expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, err => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create a new token'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Password did not match the specified user'});
                }
            } else {
                callback(400, {'Error': 'Could not find such a user'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    const id = typeof data.queryStringObject.id == 'string'
        && data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id : false;

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Tokens - put
// Required fields: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    // Check that all required fields are filled out
    const id = typeof data.payload.id == 'string'
        && data.payload.id.trim().length == 20
            ? data.payload.id : false;
    const extend = typeof data.payload.extend == 'boolean'
        && data.payload.extend == true ? true : false;

    if (id && extend) {
        _data.read('tokens', id, (err, tokenData) => {
            // Make sure that token hasn't expired yet
            if (tokenData.expires > Date.now()) {
                tokenData.expires = Date.now() + 1000 * 60 * 60;
                _data.update('tokens', id, tokenData, err => {
                    if (!err) {
                        callback(200, tokenData);
                    } else {
                        callback(500, {'Error': 'Could not update the token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Token has already expired'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s) or invalid input'});
    }
};

// Tokens - delete
// Required fields: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    const id = typeof data.payload.id == 'string'
        && data.payload.id.trim().length == 20
            ? data.payload.id : false;
    console.log(typeof data.payload.id);

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                _data.delete('tokens', id, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete specified token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not find a specified token'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Vefiry if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, email, callback) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that token is for the give user and has not expired
            if (tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Simple ping handler, that checks if the server is up
handlers.ping = (data, callback) => {
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Exporting handlers
module.exports = handlers;
