'use strict';
/* eslint-disable new-cap */

/**
 * @overview Router Handler
 *
 * Handle the different routes possbiles;
 * @module  components/router
 * @requires config
 * @requires express
 * @requires ./components/logger
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const express = require('express');

// Built-in

// Mine


// -------------------------------------------------------------------
// Properties


// -------------------------------------------------------------------
// Methods


/**
 * Used to create subRouter to handle a specific root path.
 *
 * is ABSTRACT, cannot be instanciated directly.
 * Only inherited (extends);
 * @abstract
 * @class Router
 */
class Router {

  /**
   * Creates an instance of Router.
   * @param {string|RegExp|Array<string>|Array<RegExp>} url The URL to handle
   * @param {Feed} feeder The Feeder allocated to this router.
   *
   * @memberOf Router
   */
  constructor(url, feeder) {
    this.url_ = url;
    this.feed_ = feeder;
    /**
     * @private Express Router. The only to be exposed to the server component.
     */
    this.router_ = express.Router();
  }

  /**
   * @return {string} the URL handled this router.
   *
   * @memberof Router
   */
  getURL() {
    return this.url_;
  }

  /**
   * Here goes the jointure of the middle into the router.
   *
   * ** Only 2 rules must be observed and respected. **
   *
   *  1. The last middleware added, must be the error handler.
   *  2. Before that, it's the middleware to send the response.
   *  3. Otherwise, the middlewares defined on parent class will take over.
   *
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   */
  handler() {
    throw new TypeError('You have to implement the method !');
  }

  /**
   * The middleware in charge of sending the response.
   *
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   *
   * @param {any} req - The incomming request
   * @param {any} res - The response containing all data in res.locals
   * @return {any} The data
   */
  sendResponse(req, res) {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * The midldleware in charge of the error.
   *
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   *
   * @param {Error} err
   * @param {any} req
   * @param {any} res
   * @param {any} next
   * @return {string|Object} The error message
   */
  sendErr(err, req, res, next) {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * Collect all route assigned to this router.
   *
   * @return {express.Router} the router;
   */
  init() {
    this.handler();

    // -------------------------------------------------------------------
    // Must be the last middleware to send a response.
    this.router_.use(this.sendResponse);

    // -------------------------------------------------------------------
    // Must be the last to handle the error.
    this.router_.use(this.sendErr);

    return {'url': this.getURL(), 'routes': this.router_};
  }

};

// -------------------------------------------------------------------
// Exports
module.exports = Router;
