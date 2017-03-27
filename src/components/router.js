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
<<<<<<< HEAD
const express = require('express');
=======
const KoaRouter = require('koa-trie-router');
const mount = require('koa-mount');
>>>>>>> remotes/origin/koa

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
   * Creates an instance of Router by providing the URL
   *    and the feeder middleware for this routeur.
   * @param {string} url The prefix URL to handle. By default, it's on /.
   * @param {CharMogulFeed} feeder The Feeder allocated to this router.
   *
   * @memberOf Router
   */
  constructor(url = '/', feeder) {
    this.url_ = url;
    this.feed_ = feeder;
    /**
     * @private Koa Router. The only to be exposed to the server component.
     */
    this.router_ = new KoaRouter();
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
        .catch((err) => this.handleErr(err, ctx, next));
    });

    this.router_.use(this.handleResponse);
    this.handler();
    return mount(this.url_, this.router_.middleware());
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
  async handleResponse(ctx, next) {
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
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   */
  handleErr(err, ctx, next) {
    throw new TypeError('You have to implement the method !');
  }


};

// -------------------------------------------------------------------
// Exports
module.exports = Router;
