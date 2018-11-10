/**
 * Request handlers
 *
 */

// Dependencies

// Container for all handlers
const handlers = {};

// Simple ping handler, that checks if the server is up
handlers.ping = (data, callback) => {
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

handlers.home = (data, callback) => {
    callback(200, 'test');
}

// Exporting handlers
module.exports = handlers;
