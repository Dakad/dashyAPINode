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
const request = require('superagent');

// Built-in

// Mine
const Logger = require('./logger');

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
   * @param {string} widgetId - The GeckoBoard Widget Key.
   * @param {Function} promData - The function to call
   * @param {number} timeOut A specific time.
   *
   * @memberOf Pusher
   */
  constructor(widgetId, promData, timeOut = 0) {
    this.widgetId_ = widgetId;
    this.fnPromData_ = promData;
    this.timeOut_ = timeOut;
  }


  /**
   * Push the data to the Gecko Widget.
   *
   *
   * @memberOf Pusher
   */
  async push() {
    const data = await this.fnPromData_();
    request.post('https://push.geckoboard.com/v1/send/' + this.widgetId_)
      .send({'api_key': Config.geckoBoard.apiKey})
      .send({'data': data})
      .end((err, {body}) => (err) ? Logger.error(body) : Logger.info(body));
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


  /**
   * Get the intervall timeout.
   *
   * @return {number} The timeout;
   *
   * @memberOf Pusher
   */
  getTimeOut() {
    return this.timeOut_;
  }

}


// -------------------------------------------------------------------
// Exports

module.exports = Pusher;
