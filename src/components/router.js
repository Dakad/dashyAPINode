'use strict';

/**
 * @overview Router Handler
 *
 * Handle the different routes possbiles;
 * @module  components/router
 * @requires config
 * @requires Koa
 * @requires ./components/logger
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const KoaRouter = require('koa-trie-router');
const mount = require('koa-mount');

// Built-in

// Mine


// -------------------------------------------------------------------
// Properties


// -------------------------------------------------------------------
// Methods


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
   * Creates an instance of Router by providing the URL
   *    and the feeder middleware for this routeur.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {Feed} feeder The Feeder allocated to this router.
   *
   * @memberOf Router
   */
  constructor(url='/', feeder) {
    this.url_ = url;
    this.feed_ = feeder;
    this.router_ = new KoaRouter();
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
    // TODO Add error Component like Factory APIError.getAbstractError();
    throw new TypeError('You have to override this function!');
  }

  /**
   * Collect all route assigned to this router.
   *
   * @return {KoaRouter} the router;
   */
  init() {
    this.handler();
    return mount(this.url_, this.router_.middleware());
  }


};
