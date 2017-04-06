'use strict';
/**
 * @overview HTML Formatter for the Feeder.
 *
 *
 * @module  components/feeder
 *
 * @requires config
 *
 *
 */

// -------------------------------------------------------------------
// Dependencies

// Import
const Config = require('config');
// Built-in

// Mine
const Countries = require('../../config/countriesByISO-3166-alpha-2');
const Util = require('../components/util');


// -------------------------------------------------------------------
// Properties


/**
 * The feeder by excellence.
 *
 * @class CharMogulHTMLFormatter
 */
class CharMogulHTMLFormatter {

  /**
   * @static
   * @private
   * Generate <img> with the corresponding country.
   *
   * @param {string} isoCountry The country in ISO-3166 format.
   *
   * @return {String} A HTML Output.
   *
   * @memberOf CharMogulHTMLFormatter
   */
  generateFlagImg(isoCountry) {
    const srcLink = ':' + Config.api.port + '/assets/img/flags';
    return `
        <img src="${srcLink}/${isoCountry.toLowerCase()}.png" 
             alt="${Countries[isoCountry]}" 
             style="width:100;height:100;"
        >
    `.trim();
  }

  /**
   * Generate a HTML text with customer for a widget List.
   *
   * @static
   *
   * @param {Object} customer The customer
   * @param {string} customer.who The Company name or customer name.
   * @param {string|Date} customer.when The customer registred date
   * @param {string} customer.where The country can be ISO-3166-2 or the name
   *    If, defined ISO-3166-2, an <img> will be rendered with the corresponding
   *    coutry fullname.
   * @param {Number|string} customer.[mrr] The customer MRR
   *    If defined, will be formatted to Money Value with € ....
   *
   * @return {String} A HTML Output.
   * @memberOf CharMogulHTMLFormatter
   */
  toListCustomer({who, when, where, mrr}) {
    const isISO3166 = (when) => where.length === 2;

    if (when instanceof Date) {
      when = toLocaleString.call(when, 'fr-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
    }
    return `<h1><strong><ins>${who}</ins></strong></h1>
              <h2>
                When ? : <strong><ins> ${when}</ins></strong>
                </h2>
            <h2> 
              ${!isISO3166(where) ? generateFlagImg(where) : 'Where ?'}
              <strong>
                <ins>${isISO3166(when) ? Countries[where] : where}</ins>
              </strong>
            <h2>
            <hr>
              ${ (onlyLead) ?
        `<h3>
                  MRR : <strong>
                          <ins>${Util.toMoneyFormat(mrr / 100)}</ins>
                        </strong>
                  </h3>`
        : ''}
            `.replace(/[\r\n]/g, '');
  }

}


// -------------------------------------------------------------------
// Exports

module.exports = CharMogulHTMLFormatter;
