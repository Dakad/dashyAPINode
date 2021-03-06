/**
 * @overview Feeder for the Router.
 *
 * Just a middleware container. Each method has the same arguments :
 *
 * @param {any} next The next middleware to call;
 *
 * @module components/feeder
 *
 * @requires config
 * @requires superagent
 * @requires components/cache
 * @requires components/util
 *
 *
 */

// -------------------------------------------------------------------
// Dependencies

// Import
// const Config = require('config');
// const Promise = require('bluebird');
const request = require('superagent');

// Built-in

// Mine
const Cache = require('./cache');
const Util = require('./util');


// -------------------------------------------------------------------
// Properties


/**
 * The feeder by excellence.
 *
 */
class Feeder {

  /**
   * Creates an instance of Feeder.
   * @param {string} [apiUrl=''] The APIURl from whom to feed.
   *
   */
  constructor(apiUrl = '') {
    this.apiEndPoint_ = apiUrl;
    this.cache_ = new Cache();

    this.getApiUrl = () => this.apiEndPoint_;
  }


  /**
   * Check if the params sent is valid.
   * If valid, using it to fill the req.config
   * Otherwise, sent a error with the corresponding message.
   *
   * @param {any} ctx - Context of the request and response
   * @param {Function} next The next middleware to call.
   * @return {Promise} The next middleware
   */
  checkParams(ctx, next) {
    // TODO If not future check, remove it;
    return next();
  }


  /**
   * @protected
   *
   * @param {Object} query - The query used as hash.
   * @return {Promise|null} A pending Promise containing the object in cache
   *  with the given key.
   *  Or **null** if the given key does'nt exist.
   */
  getCached(query) {
    return this.cache_.get(Util.hashCode(query));
  }


  /**
   *
   * @protected
   * @param {Object} query - The query used as hash.
   * @param {Object} objToCache - The Object to put in cache.
   * @return {Boolean} If the object has been put in the cache or not
   *
   */
  setInCache(query, objToCache) {
    // Only Keep the data in cache until Tomorrow Midnight 00:00
    const tomorowMidnight = new Date();
    tomorowMidnight.setDate(tomorowMidnight.getDate() + 1);
    tomorowMidnight.setHours(0, 0, 0, 0);
    return this.cache_.store(Util.hashCode(query), objToCache, {
      'at': tomorowMidnight.getTime(),
    });
  }


  /**
   * Cache the request response' body.
   *
   * @protected
   * @abstract
   *
   * @param {Object} key - The key to use for the cache
   * @param {any} resp - The response Body.
   * @return {any} - The cache resp
   *
   * @throws {TypeError} Must implement this method in the child class.
   */
  cacheResponse(key, resp) {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * Send a request to endpoint API.
   *
   * @protected
   * @param {string} destination - The endpoint in this API
   * @param {Object} query The query params to send to API
   * @param {string|Array|Object} keyForCache The key to use to cache the body
   * @return {Promise} a pending Promise
   *
   */
  async requestAPI(destination, query, keyForCache) {
    // Get The cached response for this request
    if (keyForCache) {
      const cachedResp = await this.getCached(keyForCache);
      if (cachedResp !== null) {
        return cachedResp;
      }
    }

    // Request No cache-able
    // no cached response for this req

    // if (!destination) {
    //   throw new Error('Missing the destination for ' + this.apiEndPoint_);
    // }
    // if (!destination.startsWith('/')) {
    //   destination = '/' + destination;
    // }
    try {
      // Sending the request to the API
      const {
        body,
      } = await request
        .get(this.apiEndPoint_ + destination)
        .query(query);

      // Store the resp in cache if necessary.
      return this.cacheResponse(keyForCache, body);
    } catch (err) {
      throw err;
    }
  }

};


// -------------------------------------------------------------------
// Exports

module.exports = Feeder;
