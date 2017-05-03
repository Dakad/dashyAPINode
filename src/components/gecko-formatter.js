'use strict';

/**
 * Formatter for the GeckoBoard Widget.
 *
 * @module  components/gecko-formatter
 * @requires config
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
   * Render data to correspond with the Funnel Widget.
   *
   * @param {Array} items - Items to display on the widget
   * @param {boolean} [notPercent=false] - ? The percent value is hidden ?
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @memberOf GeckoBoardFormatter
   */
  static toFunnel(items, notPercent = true) {
    if (Util.isEmptyOrNull(items)) {
      throw new Error('Items is required and cannot be null or empty');
    }

    const data = {
      'item': items.map(({label, value}) => ({
        label,
        value,
      })),
    };
    data['percentage'] = (notPercent) ? 'hide' : undefined;
    return data;
  }


  /**
   *
   * Render data to correspond with the LeaderBoard Widget.
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
   * @memberOf GeckoBoardFormatter
   */
  static toLeaderboard(items, format = 'decimal', unit) {
    if (Util.isEmptyOrNull(items)) {
      throw new Error('Items is required and cannot be null or empty');
    }

    const data = {
      'format': format,
      'unit': unit,
      'items': items.map(({label, value, prevRank}) => ({
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
   * Render data to correspond with the GeckoMeter Widget.
   *
   * @param {number} value - The current value
   * @param {number} [min=0] - The minimun value
   * @param {number} [max=0] - The maximum value
   * @param {string} format - Kind for format : percent || currency
   * @param {string} unit - Can be USD, GBP, EUR
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @memberOf GeckoBoardFormatter
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
   * Render data to correspond with the Monitoring Widget.
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
   * @memberOf GeckoBoardFormatter
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
   * Render data to correspond with the GeckoMeter Widget.
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
   * @param {any|Array} sec - The second value used as comparison.
   * If array, will rendered a little trendline on the seconde line.
   *
   * @return {Object} An Output formatted to the LeaderBoard widget.
   *
   * @memberOf GeckoBoardFormatter
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
   * Render data to correspond with the Text Widget.
   *
   * @param {Array} items - Items to display on the widget
   * @param {string} items.text - The text to display for this item.
   * @param {int} [items.type=0]
   *
   * @return {Object} An Output formatted to the Text widget.
   *
   * @memberOf GeckoBoardFormatter
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
