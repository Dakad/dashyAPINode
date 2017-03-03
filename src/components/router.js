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

/**
 * Express Router. The only to be exposed to the server component.
 * @private
 */
const router = express.Router();


// -------------------------------------------------------------------
// Methods

/**
 * Middleware to check the inconming request.
 *  1. Check if the req is right
 *  2. Insert a config Object in the req
 *  3. Insert a data Object into the req containnig the geckoBoard ApiKey.
 *
 * @param {any} req The incoming request
 * @param {any} res The outgoing response.
 * @param {any} next The next middleware to call;
 *
 */
const checkMiddleware = function middleware(req, res, next) {
  Logger.warn('First Middleware : Missing some check before continue');
  req.config = {};

  // ApiKey for GeckoBoard
  res.data = {
    'api': Config.geckoBoard.apiKey,
  };
  next();
};


// -------------------------------------------------------------------
// Exports


/**
 * Use to create subRouter to handle a specific root path.
 *
 * is ABSTRACT, cannot be instanciated directly.
 * Only inherited (extends);
 * @abstract
 * @class Router
 */
module.exports = class Router {

  /**
   * Creates an instance of Router.
   * @param {string|RegExp|Array<string>|Array<RegExp>} url The URL to handle
   * @param {Feed} feeder The Feeder allocated to this router.
   *
   * @memberOf Router
   */
  constructor(url, feeder) {
    this.url_ = url;
    this.router_ = express.Router();
    this.feed_ = feeder;

    // this.route_.use(this.feed_.checkParams());
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
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   */
  handler() {
    throw new TypeError('You have to implement the method fctAbst !');
  }

  /**
   * Collect all route assigned to this router.
   *
   * @return {express.Router} the router;
   */
  init() {
    this.handler();

    return this.router_;
  }

  /**
   * Add a new Router.
   * @static
   * @param {Router} router the new Route to add.
   */
  static add(router) {
    router.use(router.getURL(), router.init());
  };


  /**
   * Init the routing for the app.
   * @param {Array<Router>} routers Array of routes
   * @return {express.Routeur} an express Router set with all routes.
   */
  static init(...routers) {
    router.use(checkMiddleware);

    return router;
  };


};
