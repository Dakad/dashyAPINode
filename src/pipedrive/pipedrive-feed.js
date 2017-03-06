/**
 * @overview Feeder for the pipedrive router.
 *
 * @module {Feeder} feeds/pipedrive
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const Config = require('config');

// Built-in

// Mine
const Util = require('../components/util');
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
   *  2. Put the fetched pipeline in res.locals;
   *  3. Put all stages in this pipeline
   *
   * @param {any} req The incoming request
   * @param {any} res The outgoing response.
   * @param {any} next The next middleware to call.
   */
  getPipeline(req, res, next) {
    res.locals.api_token = Config.pipeDrive.apiToken;

    Util.requestPipeDriveFor('/pipelines', res.locals)
      .then((pipelines) => {
        res.locals.pipeline = pipelines.find((pipe) => {
          return pipe.name === Config.pipeDrive.pipeline;
        });
        res.locals.pipeline_id = res.locals.pipeline.id;
        return Util.requestPipeDriveFor('/stages', res.locals);
      }).then((stages) => {
        res.locals.pipeline.stages = stages;
        next();
      }).catch((err) => next(err));
  }

};
