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
   * @param {PipeDriveFeed} feeder The pipedrive Feeder.
   */
  constructor(url, feeder) {
    super(url);
    this.feed_ = feeder;
  }

  /** @inheritdoc */
  handler() {
    this.router_.use(this.feed_.getPipeline);

    // this.router_.use(this.feed_.sendData);
  }


};
