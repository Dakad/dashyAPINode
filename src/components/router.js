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

/**
 * Use to create subRouter to handle a specific root path.
 *
 * is ABSTRACT, cannot be instanciated directly.
 * Only inherited (extends);
 * @abstract
 * @class Router
 */
class Router {

  /**
   * Creates an instance of Router.
   * @param {CharMogulFeed} feeder The Feeder allocated to this router.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {number} pushTimeOut The intervall of sec before the pushing
   *
   * @memberOf Router
   */
  constructor(feeder, url = '/', pushTimeOut = 30) {
    this.url_ = url;
    this.feed_ = feeder;
    this.pushTimeOut_ = 1000 * pushTimeOut;

    /** @private */
    this.router_ = new KoaRouter();

    /**
     * @private List of Pusher. Will be filled with pusher on child Router.
     * @typedef {Array<Pusher>} pusher
     */
    this.listPushers_ = [];
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
   * Collect all route assigned to this router.
   *
   * @return {KoaRouter} the router;
   */
  init() {
    this.router_.use((ctx, next) => {
      return next()
        .catch((err) => this.sendErr(err, ctx, next));
    });

    this.router_.use(this.sendResponse);
    this.handler(); // Call the middlewares in other Child Router
    this.initPusher();
    return mount(this.url_, this.router_.middleware());
  }

  /**
   * Collect all pushed added to the list.
   * Call the pusher action on
   */
  initPusher() {
    this.handlerPusher(); // Collect pushers in other Child Router
    if(this.listPushers_.length === 0)
      return;
    this.listPushers_.forEach((pusher) => {
      setInterval(
        pusher.push.bind(pusher),
        pusher.getTimeOut()|| this.pushTimeOut_
      );
    });
  }


  /**
   * Here goes the jointure of the middle into the router.
   *
   * ** Only 2 rules must be observed and respected. **
   *
   *  1. The first middleware added, must be the error handler.
   *  2. After that, it's the middleware to send the response.
   *  3. Otherwise, the middlewares defined on parent class will take over.
   *
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child class.
   * @memberof Router
   */
  handler() {
    // TODO Add error Component like Factory APIError.getAbstractError();
    throw new TypeError('You have to override this function!');
  }

  /**
   * Use to add Pusher into the list of Pushers.
   *
   * @memberOf Router
   */
  handlerPusher() {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * The middleware in charge of sending the response.
   *
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child class.
   * @memberof Router
   *
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   * @return {Function} the next middleware()
   */
  async sendResponse(ctx, next) {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * The midldleware in charge of sending the error.
   *
   * @abstract
   * @throws {TypeError} Must implement this method in the child.
   * @memberof Router
   *
   * @param {Error} err
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   */
  sendErr(err, ctx, next) {
    throw new TypeError('You have to implement the method !');
  }


};

// -------------------------------------------------------------------
// Exports
module.exports = Router;
