/**
 * Helpers for various tasks
 *
 */

// Dependencies

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

// Exporting helpers
module.exports = helpers;
