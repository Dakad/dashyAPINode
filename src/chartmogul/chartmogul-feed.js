/**
 * @overview Feeder for the chartmogul router.
 *
 * @requires components/feeder
 * @module {Feeder} feeds/chartmogul
 */


// -------------------------------------------------------------------
// Dependencies

// Packages


// Built-in


// Mine
const Feeder = require('../components/feeder');

// -------------------------------------------------------------------
// Properties

/**
 * Feeder for ChartMogul route
 *
 * @class ChartMogulFeed
 * @extends {Feeder}
 */
class ChartMogulFeed extends Feeder {

  /**
   * Creates an instance of ChartMogulFeed.
   * Init the ChartMogul Config.
   *
   * @memberOf ChartMogulFeed
   */
  constructor() {
    super();
    // this.config_ =
  }

  /**
   * The firstMiddleware where the request must go first.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  firstMiddleware(req, res, next) {
    next();
  }

}


// -------------------------------------------------------------------
// Exports
module.exports = ChartMogulFeed;
