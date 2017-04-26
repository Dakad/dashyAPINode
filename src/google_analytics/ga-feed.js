/**
 * @overview Feeder for the chartmogul router.
 *
 * @requires config
 * @requires bluebird/Promise
 * @requires superagent
 *
 * @requires components/feeder
 * @requires components/feeder
 * @module {Feeder} feeds/chartmogul
 */


// -------------------------------------------------------------------
// Dependencies

// npm package
const Config = require('config');
// const Promise = require('bluebird');
const request = require('superagent');
const googleToken = require('gtoken');


// Built-in


// Mine
const Logger = require('../components/logger');
const Feeder = require('../components/feeder');
const Util = require('../components/util');
// const HTMLFormatter = require('./ga-format-html');


// -------------------------------------------------------------------
// Properties

/** @private  @constant {String} The key for the nbLeads in the cache */
// const KEY_GA_TOKEN = 'GoogleAuthAccessToken';

/** @private The required query for the request to GA  */
const requiredQuery = [
  'start-date',
  'end-date',
  'metrics',
];


const {
  'google-analytics': ConfigGA,
} = Config;

/**
 * * Feeder for Google Analytics route
 *
 * @class GoogleAnalyticsFeed
 * @extends {Feeder}
 */
class GoogleAnalyticsFeed extends Feeder {


  /**
   * Creates an instance of GoogleAnalyticsFeed.
   *
   * @memberOf GoogleAnalyticsFeed
   */
  constructor() {
    super(ConfigGA.apiUrl);


    /** @private  */
    this.gaJWTClient_ = googleToken(ConfigGA.auth);
  }

  /** @override */
  cacheResponse(key, resp) {
    if (key) { // ? Defined a key for the store ?

    }
    console.log(resp);

    return resp;
    // TODO Must implements the cacheResponse()
  }


  /**
   * @private
   *
   * Reduce the filters array into a simple string;
   *
   * @param {string[]} filters - The filters
   * @param {String} [combinator='AND'] - The
   * @return {String} All filter concatened
   *
   * @memberOf GoogleAnalyticsFeed
   */
  flatFilters(filters, combinator) {
    if (Util.isEmptyOrNull(filters) || !Array.isArray(filters)) {
      return null;
    }
    const flatFilter = (flt, comb) => {
      comb = (flt.length === 4) ? flt.shift() : combinator;
      const flat = flt.reduce((str, f) => str + f, '');
      return flat + ( (!comb) ? '' : ((comb === 'OR') ? ',' : ';'));
    };
    return filters = filters.reduce((str, filter) => {
      return str + ((Array.isArray(filter)) ? flatFilter(filter) : filter);
    }, '');
  }

  /**
   * Send a request to ChartMogul API.
   *
   * @param {Object} query - The query params to send to ChartMogul
   * @return {Promise}
   *
   * @memberOf ChartMogulFeed
   */
  async requestGAFor(query) {
    try {
      if (Util.isEmptyOrNull(query)) {
        throw new Error('Arguments:query must be defined');
      }

      // Key to be hash for REDIS
      // TODO Only cache the response on certain URL
      let keyForCache = undefined;

      // Check if got all required key into the query
      requiredQuery.forEach((requiredKey) => {
        if (!query[requiredKey]) {
          throw (new Error(`Missing ${requiredKey} in the query`));
        }
      });
      // ['ga:time','ga:views'] => 'ga:time,ga:views'
      if (Array.isArray(query.metrics)) {
        query.metrics = query.metrics.join();
      }

      // ['ga:time','ga:views'] => 'ga:time,ga:views'
      if (Array.isArray(query.dimensions)) {
        query.dimensions = query.dimensions.join();
      }

      // Flat the filters array into a string if defined
      query.filters = this.flatFilters(query.filters, query.filterCombinator);

      // Add viewIDs
      query['ids'] = 'ga:' + ConfigGA.viewId;

      query['access_token'] = await this.getAccessToken();

      // Sending the request to the API
      const {body: resp} = await request.get(this.apiEndPoint_).query(query);

      // Send the resp to be cached if necessary.
      return this.cacheResponse(keyForCache, {
        'headers': resp.columnHeaders,
        'totals': resp.totalsForAllResults,
        'rows': resp.rows,
      });
    } catch (error) {
      const {response: res} = error;
      if (res && res.body && res.body.error) {
        const resErr = res.body.error;
        Logger.error(resErr.code + ' - ' + resErr.message, resErr);
      }else{
        Logger.error(error);
      }
      throw error;
    }
  }


  /**
   *
   * Retrieve the token stored in cache or
   * Use Google Auth to get a token for a request.
   *
   * @private
   *
   * @return {Promise} - The token in cache
   */
  async getAccessToken() {
    return new Promise((resolve, reject) => {
      // No token stored in cache
      this.gaJWTClient_.getToken((err, token) => {
        return (err) ? reject(err) : resolve(token);
      });
    });
  }

  /**
   *
   * Recursive fetcher for the visitors on /apptweak.com.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchNbUniqueVisitors(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * DECODE VERSION :
     *
     * ids=ga:71071062&start-date=2017-04-01&end-date=2017-04-24
     * &metrics=ga:newUsers&dimensions=ga:userType&filters=ga:visitorType=~New
     *
     * ENCODED VERSION :
     * https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A71071062&start-date=2017-04-01&end-date=2017-04-24&metrics=ga%3AnewUsers&dimensions=ga%3AuserType&filters=ga%3AvisitorType%3D~New
     *
     *
     */


    return null;
  }


  /**
   *
   * Recursive fetcher for the AVG Session Duration on /apptweak.com.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchSessionDuration(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga%3AavgSessionDuration
     *
     */

    return null;
  }

  /**
   *
   * Recursive fetcher for the Bounce Rate on /apptweak.com.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchBounceRate(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga%3AbounceRate
     *
     */

    return null;
  }


  /**
   *
   * Recursive fetcher for the PageViews on /apptweak.com/aso-blog.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchBlogPageViews(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga:pageviews
     * &sort=-ga:pageviews
     * &filters=ga:pagePathLevel1==/aso-blog/
     *
     */

    return null;
  }


  /**
   *
   * Recursive fetcher for the PageDuration on /apptweak.com/aso-blog.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchBlogPageAVGDuration(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga:avgTimeOnPage
     * &sort=-ga:pageviews
     * &filters=ga:pagePathLevel1==/aso-blog/
     *
     */


    return null;
  }


  /**
   *
   * Recursive fetcher for the most popular articles on /apptweak.com/aso-blog.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchMostBlogPost(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga:pageviews&dimensions=ga:pageTitle
     * &sort=-ga:pageviews
     * &filters=ga:pagePathLevel1==/aso-blog/;ga:pagePathLevel2!=/category/
     * &max-results=10
     *
     */
    return null;
  }


  /**
   *
   * Recursive fetcher for the best Acquisition src on /apptweak.com/aso-blog.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async fetchBestAcquisitionSource(config) {
    /**
     * URL SAMPLE to SEND TO :
     *
     * ENCODED VERSION :
     * &metrics=ga:newUsers&dimensions=ga:source
     * &sort=-ga:newUsers
     * &filters=ga:channelGrouping==Referral
     * &max-results=10
     *
     */
    return null;
  }


} // End of Class

// -------------------------------------------------------------------
// Exports

module.exports = GoogleAnalyticsFeed;
