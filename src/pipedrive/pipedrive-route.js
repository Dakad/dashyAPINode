/**
 * @overview SubRouter to handle the all path related to /pipedrive
 *
 * @module {Router} router/pipedrive
 * @requires router
 * @requires pipedrive-feed
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
 * SubRouter to handle the /pipedrive/* route.
 *
 * @class PipeDriveRouter
 * @extends {Router}
 */
module.exports = class PipeDriveRouter extends Router {
  /**
   * Creates an instance of PipeDriveRouter.
   * @param {string|RegExp|Array<string>|Array<RegExp>} url -
   *  the path to handle for this router.
   * @param {Feeder} feeder The pipedrive Feeder.
   */
  constructor(url, feeder) {
    super(url);
    this.feed_ = feeder;
  }

  /** @inheritdoc */
  handler() {
    this.router_.use(PipeDriveRouter.getPipeline);

    // this.router_.use(this.feed_.sendData);
  }


/**
 * First middleware, to handle any request to /pipedrive,
 *  1. Go fetch te pipeline to PipedriveAPI
 *  2. Put the fetched pipeline in req.config;
 *  3. Put all stages in this pipeline
 *
 * @static
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
static getPipeline(req, res, next) {
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
