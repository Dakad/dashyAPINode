'use strict';

/**
 * @overview Base Router Handler for url /
 *
 * Handle the different routes possbiles;
 * @module  base/baserouter
 * @requires config
 * @requires components/router
 * @requires components/logger
 *
 */


// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');

// Built-in

// Mine
const Logger = require('../components/logger');
const Router = require('../components/router');

// -------------------------------------------------------------------
// Properties

/**
 * @apiGroup Base
 * Singleton Holder for the instance
 * @private
 * @const {Object} Singleton
 */
const Singleton = {
  INSTANCE: undefined,
};


// -------------------------------------------------------------------
// Methods


/**
 * Router for the root path /.
 *
 * is SINGLETON.
 * @class BaseRouter
 * @extends module:components/router~Router
 */
class BaseRouter extends Router {

  /**
   * Creates an instance of Router by providing the URL
   *    and the feeder middleware for this routeur.
   * @param {Feed} feeder The Feeder allocated to this router.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {number} timeOut The intervall of sec before the pushing
   * @private
   */
  constructor(feeder, url = '/', timeOut) {
    super(feeder, url, timeOut);
    this.router_.use(BaseRouter.checkMiddleware);
  }


  /**
   * @override
   */
  handler() {
    this.router_.use(this.sendResponse);

    this.router_.get('/', (ctx, next) => {
      if (this.url_ !== '/') {
        return ctx.redirect(`/assets/routes${this.url_}.json`);
      }
      return ctx.redirect('/zen');
    });

    /**
      *
      * @api {GET} /zen  Zen - Get Joke
      * @apiDescription Use as testing route to get randomly a good IT Joke.
      * @apiGroup Base
      * @apiVersion  0.0.1
      *
      * @apiSuccess (200) {String} joke An IT Joke.
      *
      * @apiSuccessExample {Object} Success-Response:
        {
          joke : "To understand recursion you must first understand recursion."
        }
      *
      * @apiSampleRequest /zen
      *
      */
    this.router_.get('/zen', (ctx, next) => {
      const jokes = Config.zen;
      ctx.state.data.joke = jokes[Math.floor(Math.random() * (jokes.length))];
      return next();
    });
  }


  /** @override */
  async sendResponse(ctx, next) {
    Config.api.host = ctx.origin;
    ctx.state.data = {};
    // Call the next middleware and wait for it;
    await next();
    // The response is in the state;
    ctx.body = ctx.state.data;
  }


  /** @override */
  sendErr(err, ctx, next) {
    Logger.error(err);
    ctx.status = 500;
    ctx.body = 'Something went south !';
  }


  /**
   * @return {module:base/baserouter}
   * an instance of {@link module:base/baserouter BaseRouter}.
   */
  static getInstance() {
    if (!Singleton.INSTANCE) {
      Singleton.INSTANCE = new BaseRouter();
    }
    return Singleton.INSTANCE;
  };


  /**
   * Middleware to check the inconming request.
   *  1. Check if the req is right
   *  2. Insert a config Object in the req
   *  3. Insert a data Object into the req containnig the geckoBoard ApiKey.
   *
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call;
   * @return {Function} the next middleware()
   */
  static checkMiddleware(ctx, next) {
    ctx.state.config = Object.assign({}, ctx.query);
    return next();
  };

  /** @override  */
  handlerPusher() {}

};


// -------------------------------------------------------------------
// Exports

module.exports = BaseRouter;
