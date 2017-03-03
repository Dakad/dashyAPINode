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
   *  2. Put the fetched pipeline in req.config;
   *  3. Put all stages in this pipeline
   *
   * @param {any} req The incoming request
   * @param {any} res The outgoing response.
   * @param {any} next The next middleware to call.
   */
  getPipeline(req, res, next) {
    req.config = {
      'api_token': Config.pipeDrive.apiToken,
    };

    Util.requestPipeDriveFor('/pipelines', req.config)
      .then((pipelines) => {
        req.config.pipeline = pipelines.find((pipe) => {
          return pipe.name === Config.pipeDrive.pipeline;
        });
        req.config.pipeline_id = req.config.pipeline.id;
        return (Util.requestPipeDriveFor('/stages', req.config));
      }).then((stages) => {
        req.config.pipeline.stages = stages;
        next();
      }).catch((err) => next(err));
  }

};
