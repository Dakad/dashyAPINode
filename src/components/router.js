'use strict';

/**
 * @overview Router Handler
 *
 * Handle the different routes possbiles;
 * @module components/router
 * @exports components/router
 * @requires config
 * @requires Koa
 * @requires components/logger
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const Config = require('config');
const KoaRouter = require('koa-trie-router');
const mount = require('koa-mount');

// Built-in

// Mine


// -------------------------------------------------------------------
// Properties
const defPushTimeOut = Config.geckoBoard.pushTime; // 1min

// -------------------------------------------------------------------
// Methods


/**
 * Used to create subRouter to handle a specific root path.
 * is **ABSTRACT**, cannot be instanciated directly.
 *
 */
class Router {

  /**
   * @protected
   *
   * @param {module:components/feeder} feeder What feed this router.
   * @param {string} [url='/'] The prefix URL to handle. By default, it's /.
   * @param {number} [pushTimeOut=100000] The intervall of sec before pushing
   *
   */
  constructor(feeder, url = '/', pushTimeOut = defPushTimeOut) {
    this.url_ = url;
    this.feed_ = feeder;
    this.pushTimeOut_ = 1000 * pushTimeOut;

    /** @private */
    this.router_ = new KoaRouter();

    /**
     * @const {module:components/pusher[]} pushers - List of Pusher.
     * Filled with pusher on child Router.
     */
    this.listPushers_ = [];
  }

  /**
   * Get the URL of this router.
   * @return {string} the URL handled this router.
   *
   */
  getURL() {
    return this.url_;
  }


  /**
   * Collect all routes assigned to this router.
   *
   * @return {KoaRouter} the router
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
   * Collect all {@link module:components/pusher|pushers} added to the list.
   *
   * Call the pusher action in a defined timeout intervall.
   */
  initPusher() {
    this.handlerPusher(); // Collect pushers in other Child Router
    if (this.listPushers_.length === 0)
      return;
    this.listPushers_.forEach((pusher) => {
      setInterval(
        pusher.push.bind(pusher),
        (pusher.getTimeOut() || this.pushTimeOut_)
      );
    });
  }


  /**
   * Here goes the jointure of the middle for the router.
   *
   * ** Only 2 rules must be observed and respected. **
   * Otherwise, the middlewares defined in parent class will take over.
   *
   *  1. The first middleware added, must be the error handler.
   *  2. After that, it's the middleware to send the response.
   *
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child class.
   */
  handler() {
    // TODO Add error Component like Factory APIError.getAbstractError();
    throw new TypeError('You have to override this function!');
  }

  /**
   * Use to add Pusher into the list of Pushers.
   * @protected
   * @abstract
   * @throws {TypeError} Must implement this method in the child class.
   *
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
   * @protected
   *
   * @throws {TypeError} Must implement this method in the child.
   *
   * @param {Error} err
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   */
  sendErr(err, ctx, next) {
    throw new TypeError('You have to implement the method !');
  }

};

/**
 * @constant {number} PUSH_TIME_OUT - The default timeout between each pushing.
 * @default 100000
 */
Router.PUSH_TIME_OUT = defPushTimeOut;

// -------------------------------------------------------------------
// Exports
module.exports = Router;
