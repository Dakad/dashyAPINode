/**
 * @overview  The Util Conponent.
 * @module components/util
 * @requires config
 * @requires util
 */


// -------------------------------------------------------------------
// Module' dependencies


// Import
// const Config = require('config');

// Built-in
// const util_ = require('util');

// Mine
const Countries = require('../../config/countriesByISO-3166-alpha-2');

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

    if (Number.isInteger(date) || typeof date === 'string') {
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
    if (!str ||
      (Array.isArray(str) && str.length === 0) ||
      Object.keys(str).length === 0
    ) {
      return 0;
    }

    if (typeof str !== 'string') {
      str = JSON.stringify(str);
    }

    // 5 is also a prime as 31 in JAVA
    return str
      .split('') // Array<Character>
      .reduce((hash, c) => ((hash << 5) - hash) + c.charCodeAt(0), 0);
  };


  /**
   * @param {string} str - The src to hash
   * @return {string} hex color
   */
  static hashColor(str) {
    const hex = (Util.hashCode(str) & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return '#' + '00000'.substring(0, 6 - hex.length) + hex;
  }

  //
  //  * Convert an array into an object.
  //  *
  //  * @param {Array} keys - The keys for the generated object.
  //  * @param {Array} arr - The array source.
  //  *
  //  * @return  {Object} An array mapped by his keys or passed in args.
  //  */
  // // static convertArrayToObject(keys = [], arr = []) {
  //   return Object.keys(arr).reduce((pms, p, i) => arr[p], {});
  //   // const param = arr[p];
  // };


  /**
   *
   * @static
   * @param {any} iso - The ISO3166-1-Alpha-2 code of the country.
   * @return {Object} The country corresponding to the ISO.
   */
  static getCountryFromISOCode(iso) {
    if (!iso || typeof iso !== 'string') {
      return null;
    }
    const country = Countries[iso];
    return (!country) ? {} : country;
  }

  /**
   * Check if the params, if defined, are valid.
   * @param {Object} params - The params sent in the req.
   * Also accept the req.query.
   *
   * @return {Object} Contains a boolean for inValid and a string errMsg.
   */
  /*
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
                msg = util_.format(msg, param, paramValue);
              }
              check.errMsg = msg;
            }

            return !check.isValid; // Stop  the loop if some param is not valid.
          });
      }

      return check;
    }
  */


  /**
   * Retrieve all necesary dates.
   *
   * @private
   * @static
   * @param {string} [type] - Only the kind of date
   * @return {Object} dates - All dates
   */
  static getAllDates(type) {
    // The first day in the prev. month at 00:00:00:00
    const firstInPastMonth = new Date();
    // Set this data to the last day of the prev. month.
    firstInPastMonth.setDate(0);
    firstInPastMonth.setDate(1);


    console.log(firstInPastMonth);

    // The last day in the past month
    const endInPastMonth = new Date();
    endInPastMonth.setDate(0);

    // The first day in this month at 00:00:00:00
    const firstInMonth = new Date();
    firstInMonth.setDate(1);


    const today = new Date();

    // The same day in the prev. month
    const dateInPastMonth = new Date(today.getTime());
    dateInPastMonth.setDate(today.getDate() - 30);

    const dates = {
      firstInPastMonth,
      dateInPastMonth,
      endInPastMonth,
      firstInMonth,
      today,
    };

    if(type && typeof type === 'string') {
      return dates[type];
    }

    return dates;
  }

};
