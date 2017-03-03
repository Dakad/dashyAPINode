/**
 * @overview Feeder for the Router.
 *
 * Just a middleware container. Each method has the same arguments :
 *
 * @param {any} req The incoming request
 * @param {any} res The outgoing response.
 * @param {any} next The next middleware to call;
 *
 * The ending line for each method **must be**: next();
 *
 * @module  components/feeder
 */


/**
 * The feeder by excellence.
 *
 * @class Feeder
 */
module.exports = class Feeder {

  /**
   * Creates an instance of Feeder.
   *
   * @memberOf Feeder
   */
  constructor() {

  }


  /**
   * Check if the params sent is valid.
   * If valid, using it to fill the req.config
   * Otherwise, sent a error with the corresponding message.
     *
   * @param {any} req The incoming request
   * @param {any} res The outgoing response.
   * @param {any} next The next middleware to call.
     */
  checkParams(req, res, next) {
    next();
  }

};
