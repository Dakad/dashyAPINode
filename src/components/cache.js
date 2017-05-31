'use strict';

/**
 * For the caching of data.
 *
 * @module  components/cache
 * @requires config
 * @requires bluebird
 * @requires redis
 * @requires components/logger
 *
 * @export  components/cache
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

/** */
class Cache {
  /**
   * Creates an instance of Cache.
   *
   */
  constructor() {
    this.cache_ = Redis.createClient(Config.redis);
    this.cache_.on('error', Logger.error);
  }

  /**
   *
   * @param {any} key The key used to store in cache.
   * @return {Promise} A resolved Promise containing the object in cache
   *  with the given key.
   *  Or **null** if the given key doesn't exist.
   *
   */
  get(key) {
    return this.cache_.getAsync(key).then(JSON.parse);
  }


  /**

   * @param {string} key The key to used to get/put in cache.
   * @param {Object} obj The Object to store in cache.
   * @param {Object} [exp={}] The expire time
   * @param {number|Date} exp.at The UNIX Timestamp `date.getTime()`
   * @param {number} exp.in The expire time in seconds.
   *
   * @return {Boolean} **true|false** If the object has been put in the cache
   *
   */
  store(key, obj, exp={}) {
    const isStored = Boolean(this.cache_.set(key, JSON.stringify(obj)));
    if(exp.at) {
      exp.at = (exp.at instanceof Date) ? getTime.call(exp.at) : exp.at;
      this.cache_.expireat(key, exp.at);
    }
    if(exp.in) {
      this.cache_.expire(key, exp.in);
    }
    return isStored;
  }


  /**
   *
   * @return {Redis.Client} The created Redis.Client
   *
   */
  getClient() {
    return this.cache_.multi();
  }


}


// -------------------------------------------------------------------
// Exports

module.exports = Cache;

