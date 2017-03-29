'use strict';

/**
 * For all feeder who can only be pushed to the widget.
 *
 * @module  components/pusher
 * @requires config
 * @requires winston
 *
 */

// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');

// Built-in

// Mine


// -------------------------------------------------------------------
// Properties


/**
 *
 *
 * @class Pusher
 */
class Pusher {
  /**
   * Creates an instance of Pusher.
   * @param {any} widgetId
   *
   * @memberOf Pusher
   */
  constructor(widgetId) {
    this.widgetId_ = widgetId;
    this.data_ = {};
  }

  /**
   * Get the widget ID.
   * @return {string} The widget ID.
   *
   * @memberOf Pusher
   */
  getWidget() {
    return this.widgetId_;
  }
}


// -------------------------------------------------------------------
// Exports

module.exports = Pusher;

