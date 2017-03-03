
const PipeDriveFeed = require('./pipedrive-feed');


/**
 * Mock PipeDriveFeed
 *
 * @class MockPipeFeed
 * @extends {PipeDriveFeed}
 */

module.exports = class MockPipeFeed extends PipeDriveFeed {
  /**
   * Creates an instance of MockPipeFeed.
   */
  constructor() {
    super();
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf MockPipeFeed
   */
  getPipeline(req, res, next) {
    next();
  }

};
