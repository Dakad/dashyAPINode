'use strict';

/**
 * For the caching of data.
 *
 * @module  components/cache
 * @requires config
 * @requires redis
 *
 */

// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');
const Promise = require('bluebird');
const Redis = require('redis');

// Built-in

// Mine
const Logger = require('./logger');


// -------------------------------------------------------------------
// Properties
Promise.promisifyAll(Redis.RedisClient.prototype);
Promise.promisifyAll(Redis.Multi.prototype);


/**
 * The Cache
 *
 */
class Cache {
  /**
   * Creates an instance of Cache.
   *
   * @memberOf Pusher
   */
  constructor() {
    this.cache_ = Redis.createClient(Config.redis);
    this.cache_.on('error', Logger.error);
  }

  /**
   *
   * @param {any} key The key used to store in cache.
   * @return {Promise} A Promise resolved containing the object in cache
   *  with the query provided.
   *  Or **null** if the query doesn't exist.
   *
   * @memberOf Cache
   */
  get(key) {
    return this.cache_.getAsync(key).then(JSON.parse);
  }


  /**

   * @param {string} key The key to used to get/put in cache.
   * @param {Object} obj The Object to store in cache.
   * @param {Object} [exp] The expire time
   *  - {Number|Date} **at** - The UNIX Timestamp `date.getTime()`
   *  - {Number} **in** - Specified in milliseconds
   *
   * @return {Boolean} If the object has been put in the cache or not
   *
   * @memberOf Cache
   */
  store(key, obj, exp={}) {
    if(exp.at) {
      exp.at = (exp.at instanceof Date) ? getTime.call(exp.at) : exp.at;
      this.cache_.expireat(key, exp.at);
    }
    if(exp.in) {
      this.cache_.expire(key, exp.in);
    }
    return !!this.cache_.set(key, JSON.stringify(obj));
  }


  /**
   *
   * @return {Redis.Client} The created Redis.Client
   *
   * @memberOf Cache
   */
  getClient() {
    return this.cache_.multi();
  }


}


// -------------------------------------------------------------------
// Exports

module.exports = Cache;

