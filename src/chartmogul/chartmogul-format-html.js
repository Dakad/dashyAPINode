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
   * Generate <img> with the corresponding country.
   *
   * @private
   * @static
   *
   * @param {string} isoCountry The country in ISO-3166 format.
   * @param {string} [width=150] The width for this image
   * @param {string} [height=150] The height for this image.
   *
   * @return {String} A HTML Output.
   *
   * @memberOf CharMogulHTMLFormatter
   */
  static generateFlagImg(isoCountry, width=150, height=150) {
    const srcLink = Config.api.host + '/assets/img/flags';
    return `<img src='${srcLink}/${isoCountry}.png' `+
             `alt='Flag of ${Countries[isoCountry]['name']}' `+
             'style=\'float:left;margin: 0 5px;'
              +`width:${width}px;height:${height}px;'>`;
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
  static toListCustomer({who, when, where='', mrr, city}) {
    const isISO3166 = (when) => where.length === 2;

    if (when instanceof Date) {
      when = new Intl.DateTimeFormat('fr-BE', {
        month: 'short', day: 'numeric', weekday: 'short',
        hour: 'numeric', minute: '2-digit', second: 'numeric',
        hour12: false,

      }).format(when);
    }
    return `<div>
                ${isISO3166(where)
                  ? CharMogulHTMLFormatter.generateFlagImg(where)
                  :''
                }
                <h1 style='margin:0 10px 15px 0;'>
                  <u>${(who.length>25) ? who.substr(0, 21)+' ...' : who}</u>
                </h1>
                <h2 style='margin-bottom:5px;'>
                  <img src='${Config.api.host}/assets/img/icons/datetime.png'
                        alt='DateTime'
                        style='float:left;width:25px;height:25px;margin:0 5px;'
                  />
                  ${when}
                </h2>

                <h2 style='margin-bottom:5px;'>
                  <img src='${Config.api.host}/assets/img/icons/world.png'
                        alt='City'
                        style='float:left;width:30px;height:30px;margin:0 5px;'
                  />
                ${city || Countries[where]['name'].toUpperCase()}
                </h2>

              ${ (mrr)
              ? `<h2 style='margin-bottom:5px;'>
                  <img src='${Config.api.host}/assets/img/icons/euro.png'
                        alt='MRR'
                        style='float:left;width:25px;height:25px;margin:0 5px;'
                  />
                  ${(mrr / 100)}/Month
                </h2>`
              : ''}
              </div>`.replace(/[\r\n]/g, ' ');
  }

  /**
   * Generate a HTML text with the current & best mrr for a text Widget.
   *
   * @static
   * @param {number|string} current The current Mrr
   * @param {number|string} best The best mrr.
   *
   * @return {string} A HTML Output.
   *
   * @memberOf CharMogulHTMLFormatter
   */
  static toTextNetMrr(current, best) {
    return `<p style='font-size:1.3em'>${(''+current).trim()}</p>`+
          `<img src='${Config.api.host}/assets/img/icons/cup.png'
                alt='Best Net MRR'
                style='float:left;width:45px;height:35px;margin:0 2px;'
          />
          <h1 style='font-size:1.1em;'>${(''+best).trim()}</h1>`
          .replace(/\n/g, '');
  }

 /**
   * Generate a HTML text with customer for a widget List.
   *
   * @static
   *
   * @param {Array} mrrMoves - The MRR Movements
   *
   * @return {String} A HTML Output.
   * @memberOf CharMogulHTMLFormatter
   */
  static toTextMRRMovements(mrrMoves = []) {
    const toHtml = ([label, mrr, hasSeparator]) =>{
      const color = (mrr>0) ? '#90C564' : '#E3524F';
      return `<tr style='${(hasSeparator) ? 'border-top: 1px solid;' : ''}'>`
      +`<td style='font-size:1em'>${label}</td>`
      +'<td style=\'padding:10px 5px;font-weight:bold;'
        + `text-align:right;color:${color}'>`
      + Util.toMoneyFormat(mrr, ',', '.')
      + '</td>'
      + '</tr>';
    };

    return mrrMoves.reduce(
      (html, mrr, i) => html + toHtml([mrr.label, mrr.value, (i!==0)])
     , '<table style=\'border-collapse:collapse;width:100%;font-size:medium\'>'
    ) + '</table>';
  }


 /**
   * Generate a HTML text with last customer' count
   *  and country for a widget List.
   *
   * @static
   *
   * @param {Object} countryCount - The countries<Key> with the count<Value>
   *
   * @return {String} A HTML Output.
   * @memberOf CharMogulHTMLFormatter
   */
  static toTextMrrCountryCount(countryCount) {
    const toHtml = (iso, count) => {
      return '<tr style=\'border-bottom: 1px solid;\'>'
        +'<td style=\'font-size:1em;vertical-align:middle\'>'
        + CharMogulHTMLFormatter.generateFlagImg(iso, 32, 32)
        +'</td>'
        +'<td style=\'vertical-align:middle\'>'
        + Countries[iso].name
        +'</td>'
        +'<td style=\'padding:10px 5px;font-weight:bold;text-align:right;\'>'
        + count
        + '</td>'
      + '</tr>';
    };

    return Object.keys(countryCount).reduce(
      (html, iso) => html + toHtml(iso, countryCount[iso])
     , '<table style=\'border-collapse:collapse;width:100%;font-size:medium\'>'
    ) + '</table>';
  }

}


// -------------------------------------------------------------------
// Exports

module.exports = CharMogulHTMLFormatter;
