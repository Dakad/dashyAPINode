/**
 * @overview Feeder for the Wootric router.
 *
 * @module feeder/wootric
 * @requires config
 * @requires components/logger
 * @requires components/util
 * @requires components/feeder
 * @requires formatter/gecko
 *
 */


// -------------------------------------------------------------------
// Dependencies

// npm package
const Config = require('config');
// const Promise = require('bluebird');
const request = require('superagent');


// Built-in


// Mine
const Logger = require('../components/logger');
const Feeder = require('../components/feeder');
const Util = require('../components/util');
const GeckoBoardFormatter = require('../components/gecko-formatter');


// -------------------------------------------------------------------
// Properties


/** @constant {string} KEY_TOKEN_FOR_WOOTRIC
 * The key for the oauth token  for wootric
 * @private */
const KEY_TOKEN_FOR_WOOTRIC = 'tokenForWootric';


/**
 * @const {Object} requiredKeys The only to keeps from customers data.
 * @private
 * */
const npsNecessaryKeys = [{
    entrie: 'nps',
    label: 'NPS',
  },
  {
    entrie: 'promoters',
    label: 'Promoters',
  },
  {
    entrie: 'passives',
    label: 'Passives',
  },
  {
    entrie: 'detractors',
    label: 'Detractors',
  },
];


/**
 * Feeder for wootric route
 *
 * @extends module:components/feeder~Feeder
 */
class WootricFeeder extends Feeder {


  /**
   * Creates an instance of WootricFeeder.
   *
   */
  constructor() {
    super(Config.wootric.apiUrl);
  }

  /** @override */
  cacheResponse(key, resp) {
    if (!Util.isEmptyOrNull(key)) { // ? Defined a key for the store ?
      // If got a defined key, this resp must be cached
      super.setInCache(key, resp);
    }
    return resp;
  }

  /**
   * Send a request to Wootric API for an oAuth Token.
   *
   * @return {Promise}
   *
   */
  async requestWootricForToken() {
    try {
      console.log(Config.wootric);
      const {
        body,
      } = await request
        .post(Config.wootric.authUrl)
        .send({
          'grant_type': Config.wootric.grantType,
        })
        .send({
          'client_id': Config.wootric.clientId,
        })
        .send({
          'client_secret': Config.wootric.clientSecret,
        });

      this.cache_.store(Util.hashCode(KEY_TOKEN_FOR_WOOTRIC), body, {
        'in': body.expires_in,
      });
      return body;
    } catch (e) {
      Logger.error(e);
    }
  }


  /**
   *
   * Retrieve the token stored in cache or
   * Request an oauth token from Wootric API
   *
   * @private
   *
   * @return {Promise} - The token in cache
   */
  async getAccessToken() {
    let oAuthToken = await this.getCached(KEY_TOKEN_FOR_WOOTRIC);
    if (oAuthToken === null) {
      oAuthToken = await this.requestWootricForToken();
    }
    return oAuthToken['access_token'];
  }


  /**
   * Send a request to Wootric API.
   *
   * @param {string} destination The endpoint to reach.
   * @param {Object} [query={}] - The query params to send to Wootric API
   * @return {Promise}
   *
   */
  async requestWootricFor(destination, query = {}) {
    try {
      if (!destination) {
        throw new Error('Missing the destination for ' + this.apiEndPoint_);
      }
      if (!destination.startsWith('/')) {
        destination = '/' + destination;
      }

      // Key to be hashed for REDIS
      let keyForCache = Object.assign({}, query, {
        'destination': destination,
        'date[start]': undefined,
        'date[end]': undefined,
      });

      // Get The cached response for this request
      const resCached = await super.getCached(keyForCache);
      if (resCached !== null) {
        return resCached;
      }
      // No cached response for this request
      query['access_token'] = await this.getAccessToken();
      return super.requestAPI(destination, query, keyForCache);
    } catch (err) {
      Logger.error(err);
      // if (res && res.body && res.body.error) {
      //   const resErr = res.body.error;
      //   Logger.error(resErr.code + ' - ' + resErr.message, resErr);
      // } else {
      //   Logger.error(error);
      // }
      throw err;
    }
  }


  /**
   *
   * Fetcher for the Net Promoter Score on Wootric.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   */
  async fetchNPS(config) {
    const {
      last30Days,
      today,
    } = Util.getAllDates();


    const nps = await this.requestWootricFor(
      '/nps_summary', {
        'date[start]': Util.convertDate(last30Days),
        'date[end]': Util.convertDate(today),
      }
    );
    const items = npsNecessaryKeys.reduce((items, {label, entrie}) => {
      items.push([
        label, nps[entrie],
      ]);
      return items;
    }, []);

    return GeckoBoardFormatter.toLeaderboard(items);
    /*
        return GeckoBoardFormatter.toNumberAndSecondStat({
          'absolute': true,
          'value': Number.parseInt(nps),
        }, {
          'value': Number.parseInt(oldNps),
        });
    */
  }


} // End of Class

// -------------------------------------------------------------------
// Exports

module.exports = WootricFeeder;
