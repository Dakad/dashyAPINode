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
const BaseRouter = require('../base/baserouter');

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
   * @param {PipeDriveFeed} feeder The pipedrive Feeder.
   */
  constructor(feeder) {
    super('/pipedrive', feeder);
  }

  /** @inheritdoc */
  handler() {
      this.router_.get('/', BaseRouter.checkMiddleware);

    // this.router_.use(this.feed_.getPipeline);

    // this.router_.use(this.feed_.sendData);
  }


};
