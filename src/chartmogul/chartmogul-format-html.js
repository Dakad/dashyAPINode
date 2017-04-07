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
   * @private @static
   * Generate <img> with the corresponding country.
   *
   * @param {string} isoCountry The country in ISO-3166 format.
   *
   * @return {String} A HTML Output.
   *
   * @memberOf CharMogulHTMLFormatter
   */
  static generateFlagImg(isoCountry) {
    const srcLink = Config.api.host + '/assets/img/flags';
    return `
        <img src="${srcLink}/${isoCountry}.png" 
             alt="${Countries[isoCountry]}" 
             style="width:50;height:50;"
        >`.trim();
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
  static toListCustomer({who, when, where='', mrr}) {
    const isISO3166 = (when) => where.length === 2;

    if (when instanceof Date) {
      when = toLocaleString.call(when, 'fr-BE')
              .replace(' GMT+0200 (CEST)', '');
    }
    return `<h1><strong>${who}</strong></h1>
              <h2>
                When ? : <b><u>${when}</u></b>
                </h2>
              ${!isISO3166(where) ? 'Where ?'
              : CharMogulHTMLFormatter.generateFlagImg(where) }
            <h2> 
              <strong>
                <ins>${isISO3166(where) ? Countries[where] : where}</ins>
              </strong>
            <h2>
              ${ (mrr) ?
        `<hr>
        <h3>
        MRR : <strong>
                <ins>${Util.toMoneyFormat(mrr / 100)}</ins>
              </strong>
        </h3>`
        : ''}
            `.replace(/[\r\n]/g, '');

            /*<h1  style="margin: 5px 10px 10px;"><b><u>My website name</u></b></h1>

<div>
  <img src="https://avatars0.githubusercontent.com/u/5960567?v=3&s=60g" alt="Flag of " 
        style="float:left;width: 130px;height: 110px;margin: 0 10px;"
  />
  <h2><img src="https://cdn2.iconfinder.com/data/icons/snipicons/500/time-32.png" alt="DateTime" style="float:left;width: 25px;height: 25px;margin: 0 5px;"/><b>Fri Apr 07 2017 15:00:00</b></h2>
<br>
<h2><img src="https://cdn0.iconfinder.com/data/icons/shift-free/32/Currency_Euro-32.png" alt="MRR" style="float:left;width: 25px;height: 25px;margin: 0 5px;"/><b>2199,65</b></h2>
<br>
<h2><img src="https://cdn0.iconfinder.com/data/icons/gcons-2/21/world7-48.png" alt="Where" style="float:left;width: 25px;height: 25px;margin: 0 5px;"/><b>Country</b></h2>

</div>*/

  }

}


// -------------------------------------------------------------------
// Exports

module.exports = CharMogulHTMLFormatter;
