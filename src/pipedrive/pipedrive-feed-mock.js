/**
 * @overview Feeder for the pipedrive router.
 *
 * @module {Feeder} feeds/pipedrive
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const Config = require('config');
// const sinon = require('sinon');

// Built-in

// Mine
// const Util = require('../components/util');
const PipeDriveFeed = require('./pipedrive-feed');


// -------------------------------------------------------------------
// Properties

// const UtilRequestPipe = sinon.stub(Util, 'requestPipeDriveFor').returns({
//     username: 'foo',
//     passwrod: hash('1 234'),
// });

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
