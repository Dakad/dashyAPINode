'use strict';

/**
 * Formatter for the GeckoBoard Widget.
 *
 * @module  formatter/gecko
 * @requires config
 * @requires components/util
 *
 */

// -------------------------------------------------------------------
// Dependencies

// npm
// const Config = require('config');


// Built-in

// Mine
// const Logger = require('./logger');
const Util = require('./util');


// -------------------------------------------------------------------
// Properties


/**
 * The Formatter for GeckoBoard Widget
 *
 */
class GeckoBoardFormatter {


  /**
   *
   * Render data to correspond with the
   * {@link https://developer-custom.geckoboard.com/#funnel Funnel Widget}
   *
   * @param {Array} items - Items to display on the widget
   * @param {boolean} [notPercent=true] - ? The percent value is hidden ?
   *
   * @return {Object} An Output formatted to the Funnel widget.
   *
   * @see https://developer-custom.geckoboard.com/#funnel
   */
  static toFunnel(items, notPercent = true) {
    if (Util.isEmptyOrNull(items)) {
      throw new Error('Items is required and cannot be null or empty');
    }

    const data = {
      'item': items.map(([label, value]) => ({
        label,
        value,
      })),
    };
    data['percentage'] = (notPercent) ? 'hide' : undefined;
    return data;
  }


  /**
   *
   * Render data to correspond with the
   * {@link https://developer-custom.geckoboard.com/#leaderboard LeaderBoard}
   * Widget.
   *
   * @param {Array} items - Items to display on the widget
   * @param {string} items.label - The text to display for this item.
   * @param {int} items.value - The value for this item.
   * @param {string} items.previous_rank - The name is enough obvious.
   * @param {string} [format='decimal'] - Kind of format: (percent | currency)
   * @param {string} unit - If format is currency => unit is set (USD|GBP|EUR)
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @see https://developer-custom.geckoboard.com/#leaderboard
   */
  static toLeaderboard(items, format = 'decimal', unit) {
    if (Util.isEmptyOrNull(items)) {
      throw new Error('Items is required and cannot be null or empty');
    }

    const data = {
      'format': format,
      'unit': unit,
      'items': items.map(([label, value, prevRank]) => ({
        label,
        value,
        'previous_rank': prevRank,
      })),
    };

    if (unit) {
      data['format'] = 'currency';
    } else {
      if (format === 'currency') {
        data['unit'] = '€';
      }
    }

    return data;
  }


  /**
   *
   * Render data to correspond with the {@link
   * https://developer-custom.geckoboard.com/#geck-o-meter GeckoMeter Widget} .
   *
   * @param {number} value - The current value
   * @param {number} [min=0] - The minimun value
   * @param {number} [max=0] - The maximum value
   * @param {string} format=currency - Kind for format : percent || currency
   * @param {string} unit=€ - Can be USD, GBP, EUR
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @see https://developer-custom.geckoboard.com/#geck-o-meter
   */
  static toGeckOMeter(value, min = 0, max = 0, format, unit) {
    return {
      'item': value,
      'min': {
        'value': min,
      },
      'max': {
        'value': max,
      },
      'format': (unit) ? 'currency' : format,
      'unit': (!unit && format === 'currency') ? '€' : unit,

    };
  }


  /**
   *
   * Render data to correspond with the
   * {@link https://developer-custom.geckoboard.com/#monitoring Monitoring}
   * Widget.
   *
   * The Monitoring Widget used to display whether
   * a particular resource or service is currently reachable.
   *
   * @param {boolean} isDown - ? Is the service down  or up ?
   * @param {string} lastDownTime - When the last downtime happened.
   *  If isDown===true, will render now.
   *
   * @param {string} respTime - The current response time for the service.
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @see https://developer-custom.geckoboard.com/#monitoring
   */
  static toMonitoring(isDown, lastDownTime, respTime) {
    return {
      'status': (isDown) ? 'Down' : 'Up',
      'downTime': (isDown) ? 'NOW' :lastDownTime,
      'responseTime': respTime,
    };
  }


  /**
   *
   *
   * Render data to correspond with the
   * {@link https://developer-custom.geckoboard.com/#number-and-secondary-stat
   * Number & Secondary Stat Widget}.
   *
   * @param {Object} primary {value, prefix, label, type, absolute, reverse}
   * @param {number|string} primary.value - The primary value to display.
   * @param {string} primary.prefix - The prefix next to the value. Can be
   *  ($|£|€|%|#)
   * @param {string} primary.label - If the widget is big enough, the label
   *  to display.
   * @param {string} primary.type - The type of data (text|time_duration)
   * @param {boolean} primary.absolute - ? The comparison is the difference ?
   * @param {boolean} primary.reverse - ? The comparison is reversed ?
   *  ? A down is a good  and up, bad ?
   *
   * @param {string|Array|Object} sec - The second value used as comparison.
   * If array, will rendered a little trendline on the seconde line.
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @see https://developer-custom.geckoboard.com/#number-and-secondary-stat
   */
  static toNumberAndSecondStat(primary, sec) {
    const {
      value,
      prefix,
      label,
      type,
      absolute,
      reverse,
    } = primary;
    const data = {
      'item': [{
        value,
        type,
        prefix,
        text: label,
      }],
      absolute,
      'type': (reverse) ? 'reverse' : undefined,
    };

    if (Array.isArray(sec)) {
      data.item.push(sec);
    } else {
      data.item.push({
        'value': (sec['value']) ? sec.value : sec,
        type,
        prefix,
      });
    }

    return data;
  }


  /**
   *
   * Render data to correspond with the
   * {@link https://developer-custom.geckoboard.com/#text Text Widget}.
   *
   * @param {Array} items - Items to display on the widget
   * @param {string} items.text - The text to display for this item,
   * which can either be plain text or a subset of HTML within
   * {@link https://support.geckoboard.com/hc/en-us/articles/204775348#tags
   * limited set of HTML tags}.
   *
   * @param {int} [items.type=0] - The type for the item
   * {@link https://developer-custom.geckoboard.com/#parameters-29 0,1,2}
   *
   * @return {Object} An Output formatted to the Text widget.
   *
   * @see https://developer-custom.geckoboard.com/#text
   *
   */
   static toText(items) {
     const res = {
       item: [],
     };

    if(Array.isArray(items)) {
      res.item = items;
    }else{
      if(typeof items === 'object') {
        res.item.push(items);
      }else{
        if(typeof items === 'string') {
          res.item.push({
            'text': items,
            'type': 0,
          });
        }
      }
    }

    return res;
  }


} // End  of Class


// -------------------------------------------------------------------
// Exports

module.exports = GeckoBoardFormatter;
