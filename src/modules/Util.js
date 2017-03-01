/**
 * Util Conponents.
 *
 */


// -------------------------------------------------------------------
// Modules dependencies


// Import
const Config = require('config');

// Built-in
const util = require('util');

// Mine


// Vars
const Util = {};


/**
 * Check if the given Object is undefined,null or empty.
 *
 * @param {Object} obj - The object to check.
 * @return {Boolean}
 */
Util.isEmptyOrNull = function checkEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
};

/**
 * Convert a date into PipeDrive date format.
 *
 * @param {Date} date - The normal date.
 * @return {String} The formatted string corresponding to the date.
 */
Util.convertPipeDriveDate = function convertDate(date) {
  return date.toISOString().slice(0, 10);
};


/**
 * Convert an array into an object.
 *
 * @param {Array} arr - The array source.
 * @param {Array} keys - The keys for the generated object.
 *
 * @return  {Object} An array mapped by his keys or passed in args.
 */
Util.convertArrayToObject = function convertArray(arr) {
  return Object.keys(arr).reduce((pms, p) => arr[p], {});
  // const param = arr[p];
};


/**
 * Check if the params, if defined, are valid.
 * @param {Object} params - The params sent in the req.
 * Also accept the req.query.
 *
 * @return {Object} Contains a boolean for inValid and a string errMsg.
 */
Util.checkParams = function checkParams(params) {
  const validParams = Object.keys(Config.api.validParams);
  const check = {
    isValid: true,
    errMsg: null,
  };

  if (!Util.isEmptyOrNull(params)) {
    // First , check if that param exists
    Object.keys(params)
      .filter((param) => exists = validParams.indexOf(param) !== -1)
      .some((param) => { // Then, check if valid
        switch (param) {
          default: // This params'value is enumerated;
            const validParam = Config.api.validParams[param];
            check.isValid = (validParam.indexOf(params[param]) !== -1);
            break;

          case 'for': // param for must be a Number
            if (typeof params.for === 'string') {
              params.for = Number.parseInt(param.for, 10);
            }
            check.isValid = (params.for > 0 && params.for <= 12);
            break;
        }

        if (!check.isValid) {
          let msg = Config.api.msg.err.check[param];

          if (!msg) {
            msg = Config.api.msg.err.check._def;
            msg = util.format(msg, param, params[param]);
          }
          check.errMsg = msg;
        }

        return !check.isValid; // Stop  the loop if some param is not valid.
      });
  }


  return check;
},

  // -------------------------------------------------------------------
  // Exports

  module.exports = Util;
