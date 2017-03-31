/**
 * @overview  The Util Conponent.
 * @module components/util
 * @requires config
 * @requires util
 */


// -------------------------------------------------------------------
// Module' dependencies


// Import
const Config = require('config');

// Built-in
const util = require('util');

// Mine


// -------------------------------------------------------------------
// Module' Exports


module.exports = class Util {


  /**
   * Check if the given Object is undefined, null or empty.
   *
   * @param {Object} obj - The object to check.
   * @return {Boolean}
   */
  static isEmptyOrNull(obj) {
    return !obj || Object.keys(obj).length === 0;
  }


  /**
   * Convert a date into ISO 8601 date format but only in format YYYY-MM-DD.
   *
   * @param {Date|string} date - The normal date,
   * @return {String} The formatted string corresponding to the date or if not
   *    provided use the current date.
   */
  static convertDate(date) {
    if (arguments.length === 0 || date === null) {
      date = new Date();
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().slice(0, 10);
  };


  /**
   * Convert the num into a EUR currency format.
   *
   * @static
   * @param {number} num - The Number to format.
   * @param {character} delimiter - The thousand delimiter
   * @param {character} separator - The Unit separator
   * @return {string} a formatted string corresponding to the currency.
   */
  static toMoneyFormat(num, delimiter = ' ', separator = '.') {
    // return Number(num.toFixed(2)).toLocaleString('en-GB', {
    //   style: 'currency',
    //   currency: 'EUR',
    // });
    return '€ ' + num.toFixed(2)
      .replace(/(\d)(?=(\d{3})+\.)/g, `$1${delimiter}`)
      .replace('.', separator);
  }

  /**
   * @param {string|Array|Object} str - The src to hash
   * @return {number} Hascode
   */
  static hashCode(str) {
    if (!str
        || (Array.isArray(str) && str.length === 0)
        || Object.keys(str).length === 0
    ) {
      return 0;
    }

    if(typeof str !== 'string') {
      str = JSON.stringify(str);
    }

    // 5 is also a prime as 31 in JAVA
    return str
        .split('')
        .reduce((hash, c) => ((hash << 5) - hash) + c.charCodeAt(0), 0);
  };


  /**
   * Convert an array into an object.
   *
   * @param {Array} keys - The keys for the generated object.
   * @param {Array} arr - The array source.
   *
   * @return  {Object} An array mapped by his keys or passed in args.
   */
  // static convertArrayToObject(keys = [], arr = []) {
  //   return Object.keys(arr).reduce((pms, p, i) => arr[p], {});
  //   // const param = arr[p];
  // };


  /**
   * Check if the params, if defined, are valid.
   * @param {Object} params - The params sent in the req.
   * Also accept the req.query.
   *
   * @return {Object} Contains a boolean for inValid and a string errMsg.
   */
  static checkParams(params) {
    const validParams = Config.api.validParams;
    const check = {
      isValid: true,
      errMsg: null,
    };

    if (!Util.isEmptyOrNull(params)) {
      // First , check if that param exists
      Object.keys(params)
        .filter((param) => Object.keys(validParams).indexOf(param) !== -1)
        .some((param) => { // Then, check if valid
          let paramValue = params[param];
          switch (param) {
            default: // This params'value is enumerated;
              const validParamValues = validParams[param];
            check.isValid = (validParamValues.indexOf(paramValue) !== -1);
            break;
            case 'for': // param for must be a Number
                if (typeof params.for === 'string') {
                  params.for = Number.parseInt(params.for, 10);
                }
              check.isValid = (params.for > 0 && params.for <= 12);
              break;
          }

          if (!check.isValid) {
            let msg = Config.api.msg.err.check[param];
            if (!msg) {
              msg = Config.api.msg.err.check._def;
              msg = util.format(msg, param, paramValue);
            }
            check.errMsg = msg;
          }

          return !check.isValid; // Stop  the loop if some param is not valid.
        });
    }

    return check;
  }


};
