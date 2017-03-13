/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module {Router} router/chartmogul
 * @requires router
 * @requires chartmogul-feed
 */


// -------------------------------------------------------------------
// Dependencies

// Packages

// Built-in

// Mine
// const Util = require('../components/util');
const Router = require('../components/router');

// -------------------------------------------------------------------
// Properties

/**
 *
 *
 * @class ChartMogulRouter
 * @extends {Router}
 */
class ChartMogulRouter extends Router {

  /**
   * Creates an instance of ChartMogulRouter.
   * @param {any} feed
   *
   * @memberOf ChartMogulRouter
   */
  constructor(feed) {
    super('/chartmogul', feed);
  }


  /**
   *
   * @override
   *
   * @memberOf ChartMogulRouter
   */
  handler() {

  }

};


module.exports = ChartMogulRouter;
