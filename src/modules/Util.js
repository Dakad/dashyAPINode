

/**
 * Util Conponents.
 *
 */


// -------------------------------------------------------------------
// Modules dependencies


// Import


// Built-in

// Mine


// Vars
const Util = {};


/**
 * Check if the given Object is undefined,null or empty.
 *
 * @parameter {Object} obj - The object to check.
 *
 * @returns Boolean.
 */
Util.isEmptyOrNull = function checkEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
};

// -------------------------------------------------------------------
// Exports
module.exports = Util;
