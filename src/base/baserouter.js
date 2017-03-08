'use strict';

/**
 * @overview Base Router Handler for url /
 *
 * Handle the different routes possbiles;
 * @module  base/baserouter
 * @requires config
 * @requires components/router
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


// -------------------------------------------------------------------
// Exports


/**
 * Router for the root path /.
 *
 * is SINGLETON.
 * @class BaseRouter
 */
module.exports = class BaseRouter extends Router {

  /**
   * Creates an instance of Router by providing the URL
   *    and the feeder middleware for this routeur.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {Feed} feeder The Feeder allocated to this router.
   *
   * @memberOf Router
   */
  constructor(url = '/', feeder) {
    super(url, feeder);
  }


  /**
   * @override
   */
  handler() {
    this.router_.use(BaseRouter.checkMiddleware);

    this.router_.get(['/', '/zen'], function(req, res, next) {
      const jokes = Config.zen;
      const num = Math.floor(Math.random() * (jokes.length));
      res.locals.data.joke = jokes[num];
      next();
    });

    // -------------------------------------------------------------------
    // Must be the last middleware to send a response.

    this.router_.use(function(req, res) {
        console.log('********* RES SENT ******');
        return res.json(res.locals.data);
    });


    this.router_.use(function(err, req, res, next) {
      Logger.error(err);
      return res.status(500).send('Something went south !');
    });
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
   * @param {any} req The context of the request and response.
   * @param {any} res The context of the request and response.
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
  };


};


