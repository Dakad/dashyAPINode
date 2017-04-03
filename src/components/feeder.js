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
   *
   * @memberOf Feeder
   */
  constructor(apiUrl = '') {
    this.apiEndPoint_ = apiUrl;
    this.cache_ = Redis.createClient(Config.redis);
    this.cache_.on('error', Logger.err);

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
    return this.cache_.hgetallAsync(Util.hashCode(query));
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
    return !!this.cache_.hmsetAsync(key, objToCache);
  }


  /**
   * Send a request to ChartMogul API.
   *
   * @protected
   * @param {string} destination - The pipedrive endpoint
   * @param {Object} query - The query params to send to ChartMogul
   * @param {boolean} intoCache - The query params to send to ChartMogul
   * @return {Promise}
   *
   * @memberOf ChartMogulFeed
   */
  requestAPI(destination, query, intoCache) {
    return new Promise((resolve, reject) => {
      if (!destination) {
        return reject(
          new Error('Missing the destination for '+ this.apiEndPoint_)
        );
      }

      if (!destination.startsWith('/')) {
        destination = '/' + destination;
      }
      // TODO Add Redis Caching System

      request.get(this.apiEndPoint_+ destination)
        .auth(Config.chartMogul.apiToken, Config.chartMogul.apiSecret)
        .query(query)
        .end((err, res) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(res.body);
          }
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
