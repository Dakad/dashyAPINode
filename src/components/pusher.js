'use strict';

/**
 * For all feeder who can only be pushed to the widget.
 *
 * @module components/pusher
 *
 * @requires config
 * @requires request
 * @requires components/logger
 *
 * @export components/pusher
 */

// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');
const request = require('superagent');

// Built-in

// Mine
const Logger = require('./logger');
// const PUSH_TIME_OUT = require('../components/router').PUSH_TIME_OUT;

// -------------------------------------------------------------------
// Properties


/**
 * Use to push data into a GeckoWidget.
 * Require the widget ID, the promise Function
 *
 */
class Pusher {
  /**
   * Creates an instance of Pusher.
   * @param {string} widgetId - The GeckoBoard Widget Key.
   * @param {Promise} promData - The pending promise for widget data.
   * @param {number} [timeOut] A specific time.
   *
   */
  constructor(widgetId, promData, timeOut) {
    if (!widgetId) {
      throw new Error('Required the Widget ID for pushing');
    }

    if (!promData || !(promData instanceof Promise)) {
      throw new Error(`[PUSHER] ${widgetId} require a promise`);
    }

    this.widgetId_ = widgetId;
    this.fnPromData_ = promData;
    this.timeOut_ = timeOut;
  }


  /** Push the data to the Gecko Widget.*/
  async push() {
    try {
      const data = await this.fnPromData_;
      try {
      await request.post(Config.geckoBoard.pushUrl + this.widgetId_)
        .send({
          'api_key': Config.geckoBoard.apiKey,
          'data': data,
        });
      } catch (err) {
        throw (err.response.body);
      }
    } catch (e) {
      Logger.error('[PUSHER] ' + this.widgetId_, e);
    }
  }


  /** @return {string} The widget ID */
  getWidget() {
    return this.widgetId_;
  }


  /** @return {number} The intervall timeout*/
  getTimeOut() {
    return this.timeOut_;
  }

}


// -------------------------------------------------------------------
// Exports

module.exports = Pusher;
