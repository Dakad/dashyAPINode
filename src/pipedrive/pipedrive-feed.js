/**
 * @overview Feeder for the pipedrive router.
 *
 * @module {Feeder} feeds/pipedrive
 */


// -------------------------------------------------------------------
// Dependencies

// Packages

// Built-in

// Mine
// const Util = require('../components/util');
const Feeder = require('../components/feeder');

// -------------------------------------------------------------------
// Properties


/**
 * Middleware handler for the pipedrive route;
 *
 * @class PipeDriveFeed
 * @extends {Feeder}
 */
module.exports = class PipeDriveFeed extends Feeder {
  /**
   * Creates an instance of PipeDriveFeed.
   *
   * @memberOf PipeDriveFeed
   */
  constructor() {
    super();
  }


  /**
* First middleware, to handle any request to /pipedrive,
*  1. Go fetch te pipeline to PipedriveAPI
*  2. Put the fetched pipeline in req.config;
*  3. Put all stages in this pipeline
*
* @param {any} req The incoming request
* @param {any} res The outgoing response.
* @param {any} next The next middleware to call.
*/
  getPipeline(req, res, next) {
    req.config = {};
    req.config.pipeline = {
      id: 123,
      name: 'Mein pipe',
      stages: {
        id: 123,
        name: 'Step 1',
        pipeline_id: 123,
      },
    };
    next();
  }

};
