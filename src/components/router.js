'use strict';

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
const router = new express.Router();


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
   *
   * @memberOf Router
   */
  constructor(url) {
    this.url_ = url;
    this.router_ = new express.Router();
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
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   */
  handler() {
    throw new TypeError('You have to implement the method fctAbst!');
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
    router_.use(route.getURL(), route.init());
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
