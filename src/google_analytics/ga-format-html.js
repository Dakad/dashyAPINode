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
// const Util = require('../components/util');


// -------------------------------------------------------------------
// Properties


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
    const toHtml = ([post, views, hasSeparator]) =>{
      let title = post.replace(' - ASO Blog', '');
      if(title.length > 37) {
        title = title.substr(0, 32) + '...';
      }
      return `<tr style='${(hasSeparator) ? 'border-top: 1px solid;' : ''}'>`
      +`<td style='padding-bottom:2.3px;font-size:1em'>${title}</td>`
      +'<td style=\'padding:10px 5px;font-weight:bold;\'>'+ views + '</td>'
      + '</tr>';
    };

    return blogsViews.reduce(
      (html, [post, views], i) => html + toHtml([post, views, (i!==0)])
     , '<table style=\'border-collapse:collapse;width:100%;font-size:medium\'>'
    ) + '</table>';
  }


 /**
   * Generate a HTML text for the acquisition sources with
   * The name, count & progression
   *
   * @static
   *
   * @param {Array} sources  - The acquisition sources
   *  with the name, views, progression
   *
   * @return {String} A HTML Output.
   * @memberOf GoogleAnalyticsFormatter
   */
  static toTextForTopsAcqSources(sources) {
/*
<tr>
  <td class="tg-s6z2">(%)2</td>
  <td class="tg-s6z2" colspan="2" rowspan="2">example.com/azerty2</td>
  <td class="tg-s6z2">(NB)2</td>
</tr>
<tr>
  <td class="tg-s6z2">(IMG)2</td>
  <td class="tg-s6z2">Views2</td>
</tr>
*/

    const toHtml = ([src, count, progress]) => {
      const styleCenter = 'vertical-align:middle;text-align:center';
      const progressIcon = 'icons/'+ ((progress < 0) ? 'down' : 'up') + '.png';

      return;
      '<tr style=\'border-bottom: 1px solid;\'>'
        +'<td style=\''+styleCenter+';font-size:1em;\'>'
        + progress
        +'</td>'
        +'<td style=\''+styleCenter+'\'colspan="2" rowspan="2" >'
        + src
        +'</td>'
        +'<td style=\'padding:10px 5px;font-weight:bold;text-align:right;\'>'
        + count
        + '</td>'
      +'</tr>'
      +'<tr style=\'border-bottom: 1px solid;\'>'
        +'<td style=\''+styleCenter+';font-size:1em;\'>'
        + GoogleAnalyticsFormatter.generateImg({
          src: progressIcon,
          alt: 'Progress icon',
          width: 48,
          height: 48,
        })
        +'</td>'
        +'<td style=\''+styleCenter+'\'>Views</td>'
      + '</tr>';
    };

    return sources.reduce(
      (html, src) => html + toHtml(src)
     , '<table style=\'border-collapse:collapse;width:100%;font-size:medium\'>'
    ) + '</table>';
  }

}


// -------------------------------------------------------------------
// Exports

module.exports = GoogleAnalyticsFormatter;
