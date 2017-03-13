/**
 * @overview Feeder for the pipedrive router.
 *
 * @module {Feeder} feeds/pipedrive
 * @requires promise
 * @requires superagent
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const Config = require('config');
const Promise = require('bluebird');
const request = require('superagent');

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
   *
   * @param {String} destination - The pipedrive endpoint
   * @param {Object} query - Must Contains the apiToken and the pipeline_id
   * @return {Bluebird.Promise}
   */
  requestPipeDriveFor(destination, query = {}) {
    return new Promise((resolve, reject) => {
      if (!destination) {
        return reject(new Error('Missing the destination to call PipeDrive'));
      }
      if (Util.isEmptyOrNull(query) || !query.api_token) {
        return reject(new Error('Missing the query : {apiToken}'));
      }
      if (destination[0] !== '/') {
        destination = '/' + destination;
      }

      request.get(Config.pipeDrive.apiUrl + destination)
        .query(query)
        .end((err, resp) => {
          if (err)
            reject(err);
          else
            resolve(resp.body.data);
        });
    });
  }


  /**
   * First middleware, to handle any request to /pipedrive,
   *  1. Set the token in the locals var.
   *  2. Go fetch te pipeline to PipedriveAPI
   *  3. Put the fetched pipeline in res.locals;
   *  4. Put all stages in this pipeline
   *
   * @param {any} req The incoming request
   * @param {any} res The outgoing response.
   * @param {any} next The next middleware to call.
   */
  getPipeline(req, res, next) {
    res.locals.api_token = Config.pipeDrive.apiToken;

    this.requestPipeDriveFor('/pipelines', res.locals)
      .then((pipelines) => {
        res.locals.pipeline = pipelines.find((pipe) => {
          return pipe.name === Config.pipeDrive.pipeline;
        });
        res.locals.pipeline_id = res.locals.pipeline.id;
        return this.requestPipeDriveFor('/stages', res.locals);
      }).then((stages) => {
        res.locals.pipeline.stages = stages;
        next();
      }).catch((err) => next(err));
  }

};
