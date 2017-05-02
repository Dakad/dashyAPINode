'use strict';
/**
 * @overview HTML Formatter for the Feeder.
 *
 *
 * @module  components/formatter
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
const Util = require('../components/util');


// -------------------------------------------------------------------
// Properties

const getClassColor = (nb) => (nb >= 0) ?' positive ':' negative ';

const getClassArrow =(nb) => {
  return 'arrow-' +(nb >= 0 ?'up ':'down ')+ getClassColor(nb);
};

/**
 * The feeder by excellence.
 *
 * @class GoogleAnalyticsFormatter
 */
class GoogleAnalyticsFormatter {


  /**
   * Generate <img> with the corresponding country.
   *
   * @private
   * @static
   *
   * @param {Object} img - All necessary info about the img
   * @param {string} img.src - The path to the img since /assets/img/
   * @param {string} img.alt - The alternative text for this img
   * @param {string} [img.width=150] The width for this image
   * @param {string} [img.height=150] The height for this image.
   *
   * @return {String} A HTML Output.
   *
   * @memberOf CharMogulHTMLFormatter
   */
  static generateImg({src, alt, width=150, height=150}) {
    const srcLink = Config.api.host + '/assets/img/'+src;
    return `<img src='${srcLink}' `+
             `alt='${alt}' `+
             'style=\'margin: 0 5px;'
              +`width:${width}px;height:${height}px;'>`;
  }


/**
   * Generate a HTML text for the most blog post's views .
   *
   * @static
   *
   * @param {Array} blogsViews - The blog post views
   *
   * @return {String} A HTML Output.
   * @memberOf GoogleAnalyticsFormatter
   */
  static toTextForBlogPostViews(blogsViews = []) {
    const styleCenter = 'vertical-align:middle;text-align:center';
    const getIcon = (nb) => {
      return '<i class=\'t-size-x30 arrow '+
        ((nb != 0 ) ? getClassArrow(nb) : '')
      +'\'>&nbsp;</i>';
    };

    const toHtml = ([post, views, progress, hasSeparator]) =>{
      let title = post.replace(' - ASO Blog', '');
      if(title.length > 45) {
        title = title.substr(0, 42) + '...';
      }
      return `<tr style='${(hasSeparator) ? 'border-top: 1px solid;' : ''}'>`
      +'<td style=\''+styleCenter+';padding-bottom:.3px;\'>'+
        getIcon(progress)
      +'</td>'
      +'<td style=\'font-size:1em\'>'+
        title
      +'</td>'
      +'<td style=\''+styleCenter+';padding-right:3px;font-weight:bold;\'>'+
        views
      + '</td>'
      +'<td class=\''+getClassColor(progress)+'\''
      +'style=\''+styleCenter+';padding-left:3px;font-weight:bold;\'>'+
        Math.abs(progress)
      + '</td>'
      + '</tr>';
    };

    return blogsViews.reduce(
      (html, [post, views, progress=0], i) => html + toHtml([
        post, views, progress, (i!==0),
        ])
     , '<table style=\'border-collapse:collapse;width:100%;font-size:medium\'>'
    ) + '</table>';
  }


  static toTextForDuration(first, second) {
    first = Number.parseInt(first, 10);
    const spanUnit= (time) => {
      return Object.keys(time)
        .filter((key) => ['m', 's'].indexOf(key) !== -1)
        .reduce((html, unit) =>{
          console.log(unit, time[unit]);
          if(time[unit] > 0) {
            return html + ` ${time[unit]}<span class="unit">${unit}</span>`;
          }
          return html;
        }, '');
    };


    let html = '<div class="main-stat t-size-x52">';
    html+=spanUnit(Util.toHHMMSS(first, 10));
    html+='</div>';

    if(second) {
      second = Number.parseFloat(second);
      const diff = first-second;
      html +='<br>';
      html += '<div class="main-stat t-size-x44 arrow ';
      if(diff !== 0) {
        html+= getClassArrow(diff);
      }
      html+= '">';
      html+=spanUnit(Util.toHHMMSS(Math.abs(diff)));
      html+='</div>';
    }

    return html;
  }


}


// -------------------------------------------------------------------
// Exports

module.exports = GoogleAnalyticsFormatter;
