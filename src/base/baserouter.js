'use strict';

/**
 * @overview Base Router Handler for url /
 *
 * Handle the different routes possbiles;
<<<<<<< HEAD
 * @module  base/baserouter
 * @requires config
 * @requires components/router
=======
 * @module  components/router
 * @requires config
>>>>>>> remotes/origin/koa
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

<<<<<<< HEAD
=======

>>>>>>> remotes/origin/koa
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
<<<<<<< HEAD
    this.router_.get('/zen', function(req, res, next) {
      const jokes = Config.zen;
      const num = Math.floor(Math.random() * (jokes.length));
      res.locals.data.joke = jokes[num];
      next();
    });
  }


  /**
   * @override
   */
  sendResponse(req, res) {
    return res.json(res.locals.data);
=======
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
>>>>>>> remotes/origin/koa
  }


  /**
   * @override
   */
<<<<<<< HEAD
  sendErr(err, req, res, next) {
    Logger.error(err);
    return res.status(500).send('Something went south !');
=======
  handleErr(err, ctx, next) {
    Logger.error(err);
    ctx.status = 500;
    ctx.body = 'Something went south !';
>>>>>>> remotes/origin/koa
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
<<<<<<< HEAD
   *  2. Insert a config Object in the res.locals
   *  3. Insert a data Object into the res.locals with the geckoBoard ApiKey.
   *
   * @param {any} req The request.
   * @param {any} res The response.
   * @param {any} next The next middleware to call;
   */
  static checkMiddleware(req, res, next) {
    Logger.warn('First Middleware : Missing some check before continue');
    res.locals.config = {};

    // ApiKey for GeckoBoard
    res.locals.data = {
      api: Config.geckoBoard.apiKey,
    };
    next();
=======
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
>>>>>>> remotes/origin/koa
  };


};


// -------------------------------------------------------------------
// Exports

module.exports = BaseRouter;
