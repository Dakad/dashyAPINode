/**
 * @overview SubRouter to handle the all path related to /wootric
 *
 * @module router/wootric
 * @requires router/base
 * @requires feeder/wootric
 * @requires components/util
 * @requires components/pusher
 *
 * @requires config
 *
 *
 */


// -------------------------------------------------------------------
// Dependencies

// npm
// const Config = require('config');

// Built-in

// Mine
// const Util = require('../components/util');
// const Pusher = require('../components/pusher');
const BaseRouter = require('../base/baserouter');


// -------------------------------------------------------------------
// Properties


/**
 * SubRouter to handle the all path related to /wootric
 *
 * @extends module:router/base
 */
class WootricRouter extends BaseRouter {
  /**
   * Creates an instance of WootricRouter.
   * @param {module:feeder/Wootric} feed - The feeder for this router.
   *
   */
  constructor(feed) {
    super(feed, '/wootric');
  }


  /** @override */
  handler() {
    super.handler();


    /**
      *
      * @api {GET} /wootric Get the list of routes
      * @apiName GetAllRoutesForWootric
      * @apiGroup Wootric
      * @apiVersion  0.6.0
      *
      *
      * @apiSuccess (200) {Object} routes All routes callables for /wootric
      *
      * @apiSuccessExample  {JSON} routes
        {
            title : 'METHOD /url'
        }
      *
      *
      */


    // LeaderBoard of 5 Most Plans Subscribed
    /**
     *
     * @api {GET} /wootric/nps Get the NPS Details
     * @apiName GetWootricNPS
     * @apiGroup Wootric
     * @apiVersion  0.6.0
     *
     *
     *
     * @apiSuccess (200) {Array} plans The NPS Details.
     *
     *
     * @apiSuccessExample {JSON} Success-Response:
      {
        "format" : "decimal",
        "items": [
          {
            "label": {String} NPS' details,
            "value": {number} NPS value
          }
        ]
      }
     *
     *
     */

    this.router_.get('/nps', async(ctx, next) => {
      ctx.state.data = await this.feed_.fetchNPS(ctx.state.config);
      return next();
    });
  }


  /**
   * @override
   */
  handlerPusher() {

  }

};


// -------------------------------------------------------------------
// Exports


module.exports = WootricRouter;
