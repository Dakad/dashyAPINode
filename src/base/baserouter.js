'use strict';

/**
 * @overview Base Router Handler for url /
 *
 * Handle the different routes possbiles;
 * @module  components/router
 * @requires config
 * @requires ./components/logger
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const Config = require('config');

// Built-in

// Mine
const Logger = require('../components/logger');
const Router = require('../components/router');

// -------------------------------------------------------------------
// Properties

/**
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
 */
class BaseRouter extends Router {


  /**
   * Creates an instance of Router by providing the URL
   *    and the feeder middleware for this routeur.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {Feed} feeder The Feeder allocated to this router.
   * @private
   * @constructor
   * @memberOf Router
   */
  constructor(url = '/', feeder) {
    super(url, feeder);
    this.router_.use(BaseRouter.checkMiddleware);
  }


  /**
   * @override
   */
  handler() {
    this.router_.use(this.handleResponse);
    this.router_.get('/zen', (ctx, next) => {
      const jokes = Config.zen;
      ctx.state.data.joke = jokes[Math.floor(Math.random() * (jokes.length))];
      return next();
    });
  }

  /**
   * @override
   */
  async handleResponse(ctx, next) {
    ctx.state.data = {
      api: Config.geckoBoard.apiKey,
    };
    // Call the next middleware and wait for it;
    await next();
    // The response is in the state;
    ctx.body = ctx.state.data;
  }


  /**
   * @override
   */
  handleErr(err, ctx, next) {
    Logger.error(err);
    ctx.status = 500;
    ctx.body = 'Something went south !';
  }


  /**
   * @static
   * @return {BaseRouter} a instance of {@see BaseRouter}.
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
   * @param {any} ctx The context of the request and response.
   * @param {Function} next The next middleware to call;
   * @return {Function} the next middleware()
   */
  static checkMiddleware(ctx, next) {
    // TODO First Middleware : Missing some check before continue');
    ctx.state.config = {};
    return next();
  };


};


// -------------------------------------------------------------------
// Exports

module.exports = BaseRouter;
