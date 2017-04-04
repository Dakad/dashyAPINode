/**
 * @overview Feeder for the Router.
 *
 * Just a middleware container. Each method has the same arguments :
 *
 * @param {any} next The next middleware to call;
 *
 * @module  components/feeder
 *
 * @requires config
 * @requires redis
 *
 *
 */

// -------------------------------------------------------------------
// Dependencies

// Import
const Config = require('config');
const Promise = require('bluebird');
const Redis = require('redis');

// Built-in

// Mine
const Logger = require('./logger');
const Util = require('./util');


// -------------------------------------------------------------------
// Properties
Promise.promisifyAll(Redis.RedisClient.prototype);
Promise.promisifyAll(Redis.Multi.prototype);


/**
 * The feeder by excellence.
 *
 * @class Feeder
 */
class Feeder {

  /**
   * Creates an instance of Feeder.
   * @param {string} [apiUrl=''] The APIURl from whom to feed.
   *
   * @memberOf Feeder
   */
  constructor(apiUrl = '') {
    this.apiEndPoint_ = apiUrl;
    this.cache_ = Redis.createClient(Config.redis);
    this.cache_.on('error', Logger.error);

    this.getApiUrl = () => this.apiEndPoint_;
  }


  /**
   *@protected
   *
   * @param {Object} query - The query used as hash.
   * @return {Promise|null} A Promise resolved containing the object in cache
   *  with the query provided.
   *  Or **null** if the query does'nt exist.
   * @memberOf Feeder
   */
  getCached(query) {
    return this.cache_
      .getAsync(Util.hashCode(query))
      .then(JSON.parse);
  }


  /**
   *
   * @protected
   * @param {Object} query - The query used as hash.
   * @param {Object} objToCache - The Object to put in cache.
   * @return {Boolean} If the object has been put in the cache or not
   *
   * @memberOf Feeder
   */
  setInCache(query, objToCache) {
    const key = Util.hashCode(query);
    const tomorowMidnight = new Date();
    tomorowMidnight.setDate(tomorowMidnight.getDate()+1);
    tomorowMidnight.setHours(0, 0, 0, 0);
    this.cache_.expireat(key, tomorowMidnight.getTime());
    return !!this.cache_.set(key, JSON.stringify(objToCache));
  }


  /**
   * @protected
   * @abstract
   * Cache the request response' body.
   *
   * @param {Object} key - The key to use for the cache
   * @param {any} resp - The response Body.
   *
   * @memberOf Feeder
   */
  cacheResponse(key, resp) {
    throw new TypeError('You have to implement the method !');
  }


  /**
   * Send a request to ChartMogul API.
   *
   * @protected
   * @param {string} destination - The endpoint in this API
   * @param {Object} query The query params to send to ChartMogul
   * @param {string|Array|Object} keyForCache The key to use to cache the body
   * @return {Promise}
   *
   * @memberOf Feeder
   */
  requestAPI(destination, query, keyForCache) {
    return super.getCached(key) // Get The cached response for this request
      .catch((err) => { // No cached response for this request
        return new Promise((resolve, reject) => {
          if (!destination) {
            return reject(
              new Error('Missing the destination for ' + this.apiEndPoint_)
            );
          }

          if (!destination.startsWith('/')) {
            destination = '/' + destination;
          }
          request.get(this.apiEndPoint_ + destination)
            .query(query)
            .end((err, res) => {
              if (err) {
                return reject(err);
              } else {
                this.cacheResponse(keyForCache, res.body);
                return resolve(res.body);
              }
            });
        });
      });
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
    return next();
  }

};


// -------------------------------------------------------------------
// Exports

module.exports = Feeder;
