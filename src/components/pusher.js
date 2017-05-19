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
 * Require the widget ID, the function
 *
 */
class Pusher {
  /**
   * Creates an instance of Pusher.
   * @param {string} widgetId - The GeckoBoard Widget Key.
   * @param {Function|Array} fnData - The function for widget data.
   * If array, must contains in order : [fn, ...args]
   * @param {number} [timeOut] A specific time.
   * @param {module:components/feeder} [feeder] The feeder for the binding.
   *
   */
  constructor(widgetId, fnData, timeOut, feeder) {
    if (!widgetId) {
      throw new Error('Required the Widget ID for pushing');
    }

    if (!fnData) {
      throw new Error(`[PUSHER] ${widgetId} requires a fct for the data !`);
    }

    this.widgetId_ = widgetId;

    if(timeOut) {
      this.timeOut_ = timeOut * 1000;
    }


    // ? fnData come with args ?
    if(Array.isArray(fnData)) {
      const [fn, ...args] = fnData;
      if (!(fn instanceof Function)) {
        throw new Error(`[PUSHER] ${widgetId} requires a FUNCTION !`);
      }
      this.fnForData_ = fn;
      this.fnForDataArgs_ = args;
    }else{
      this.fnForData_ = fnData;
      this.fnForDataArgs_ = [];
    }

    if(feeder) {
      this.feed_ = feeder;
      this.fnForData_.bind(this.feed_, ...this.fnForDataArgs_);
    }
  }


  /** Push the data to the Gecko Widget.*/
  async push() {
    try {
      const data = await this.fnForData_.apply(this.feed_, this.fnForDataArgs_);

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
