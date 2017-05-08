/**
 * @overview  The Util Conponent.
 * @module components/util
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
   * @return {Boolean} **true** if obj is defined and contains something
   *  otherwise **false**
   */
  static isEmptyOrNull(obj) {
    return !obj || Object.keys(obj).length === 0;
  }


  /**
   * Convert a date into ISO 8601 format keep only YYYY-MM-DD part.
   *
   * @param {Date|string|number} [date=new Date()] - The normal date or in ms.
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
   * Convert a number into a EUR currency format.
   *
   * @param {number} [num=0] - The Number to format.
   * @param {char} [delimiter='<SPACE>'] - The thousand delimiter
   * @param {char} [separator='.'] - The Unit separator
   * @return {string} a formatted string corresponding to the currency.
   */
  static toMoneyFormat(num=0, delimiter = ' ', separator = '.') {
    // return Number(num.toFixed(2)).toLocaleString('en-GB', {
    //   style: 'currency',
    //   currency: 'EUR',
    // });
    return '€ ' + num.toFixed(2)
      .replace(/(\d)(?=(\d{3})+\.)/g, `$1${delimiter}`)
      .replace('.', separator);
  }

  /**
   * Generate a hash code for a given object. Would return the same integer
   * for the same object.
   * If the given src object is **null**, will return 0;
   *
   * @param {string|Array|Object} str - The src to hash
   * @return {number} Hashcode value for this object
   */
  static hashCode(str) {
    if (!str || Util.isEmptyOrNull(src)) {
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
   * Get the full country for a given ISO code.
   * Will return **null** if the code is invalid.
   *
   * @param {string} iso - The ISO3166-1-Alpha-2 code of the country.
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
   * Retrieve all necesary dates.
   *
   * @param {string} [type] - Only the kind of date
   * @return {Object} dates - All dates.
   * @return {Object} dates.firstInPastMonth - The 1st day in previous month.
   * @return {Object} dates.dateInPastMonth - The same date in previous month.
   * @return {Object} dates.endInPastMonth - The last day in previous month.
   * @return {Object} dates.firstInMonth - The 1st day in this month.
   * @return {Object} dates.today - The today date.
   */
  static getAllDates(type) {
    // The first day in the prev. month at 00:00:00:00
    const firstInPastMonth = new Date();
    // Set this data to the last day of the prev. month.
    const month = firstInPastMonth.getMonth();
    firstInPastMonth.setDate(0);
    firstInPastMonth.setDate(1);

    // The last day in the past month
    const endInPastMonth = new Date();
    endInPastMonth.setDate(0);

    // The first day in this month at 00:00:00:00
    const firstInMonth = new Date();
    firstInMonth.setDate(1);


    const today = new Date();

    // The same day in the prev. month
    const dte = new Date();
    const dateInPastMonth = new Date(dte.setMonth(month - 1));
    // dateInPastMonth.setDate(today.getDate() - 30);

    const dates = {
      firstInPastMonth,
      dateInPastMonth,
      endInPastMonth,
      firstInMonth,
      today,
    };

    if (type && typeof type === 'string') {
      return dates[type];
    }

    return dates;
  }


  /**
   * Convert seconds to time format HHMMSS.
   * If the parameter is not given, will use Date.now().
   * If the parameter is not valid, will use 0.
   *
   * @param {number|string} [sec=Date.now()] - The number of seconds
   *  if null, use the current time,
   * @return {Object} hhmmss - Contains the duration in time,
   * @return {Object} hhmmss.time - The time of duration
   * @return {Object} hhmmss.h - The number of hours.
   * @return {Object} hhmmss.m - The number of minutes.
   * @return {Object} hhmmss.s - The number of seconds.
   * @return {Object} hhmmss.format - The formatted time '%$HH%h %$MM%m %$SS%s'
   */
  static toHHMMSS(sec) {
    let duration = Date.now();
    if (sec && (typeof sec === 'number' || typeof sec === 'float')) {
      sec = Number.parseFloat(sec);
      duration = (Number.isNaN(sec) ? 0 : sec * 1000);
    }

    const [time, h, m, s] = new Date(duration).toUTCString()
      .match(/(\d{2}):(\d{2}):(\d{2})/)
      .slice(0, 4)
      .map((res, i) => (i === 0) ? res : Number.parseInt(res, 10));

    let format = '';

    format += (h > 0) ? h + 'h ' : '';
    format += (m > 0) ? m + 'm ' : '';
    format += (s > 0) ? s + 's' : '';

    format = format.trim();

    return {
      time,
      h,
      m,
      s,
      format,
    };
  }


  // /**
  //  * @param {string} str - The src to hash
  //  * @return {string} hex color
  //  */
  // static hashColor(str) {
  //   const hex = (Util.hashCode(str) & 0x00FFFFFF)
  //     .toString(16)
  //     .toUpperCase();
  //   return '#' + '00000'.substring(0, 6 - hex.length) + hex;
  // }

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


  // /**
  //  * Check if the params, if defined, are valid.
  //  * @param {Object} params - The params sent in the req.
  //  * Also accept the req.query.
  //  *
  //  * @return {Object} Contains a boolean for inValid and a string errMsg.
  //  */
  //   static checkParams(params) {
  //     const validParams = Config.api.validParams;
  //     const check = {
  //       isValid: true,
  //       errMsg: null,
  //     };

  //     if (!Util.isEmptyOrNull(params)) {
  //       // First , check if that param exists
  //       Object.keys(params)
  //         .filter((param) => Object.keys(validParams).indexOf(param) !== -1)
  //         .some((param) => { // Then, check if valid
  //           let paramValue = params[param];
  //           switch (param) {
  //             default: // This params'value is enumerated;
  //               const validParamValues = validParams[param];
  //             check.isValid = (validParamValues.indexOf(paramValue) !== -1);
  //             break;
  //             case 'for': // param for must be a Number
  //                 if (typeof params.for === 'string') {
  //                   params.for = Number.parseInt(params.for, 10);
  //                 }
  //               check.isValid = (params.for > 0 && params.for <= 12);
  //               break;
  //           }

  //           if (!check.isValid) {
  //             let msg = Config.api.msg.err.check[param];
  //             if (!msg) {
  //               msg = Config.api.msg.err.check._def;
  //               msg = util_.format(msg, param, paramValue);
  //             }
  //             check.errMsg = msg;
  //           }

  //           return !check.isValid; // Stop  the loop if some param is not valid.
  //         });
  //     }

  //     return check;
  //   }


};
