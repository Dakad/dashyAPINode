/**
 * @overview Feeder for the chartmogul router.
 *
 * @requires config
 * @requires bluebird/Promise
 * @requires superagent
 * @requires components/feeder
 * @requires components/feeder
 * @module {Feeder} feeds/chartmogul
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const Config = require('config');
const Promise = require('bluebird');
// const ChartMogul = require('chartmogul-node');
const request = require('superagent');

// Built-in


// Mine
const Feeder = require('../components/feeder');

// -------------------------------------------------------------------
// Properties


/**
 * Feeder for ChartMogul route
 *
 * @class ChartMogulFeed
 * @extends {Feeder}
 */
class ChartMogulFeed extends Feeder {

  /**
   * Creates an instance of ChartMogulFeed.
   * Init the ChartMogul Config.
   *
   * @memberOf ChartMogulFeed
   */
  constructor() {
    super();
    // this.mogulConfig_ = new ChartMogul.Config(
    // Config.chartmogul.apiToken, Config.chartmogul.apiSecret);
  }


  /**
   * Send a request to ChartMogul API.
   *
   * @param {String} destination - The pipedrive endpoint
   * @param {Object} query - The query params to send to ChartMogul
   * @return {Promise}
   *
   * @memberOf ChartMogulFeed
   */
  requestChartMogulFor(destination, query) {
    return new Promise((resolve, reject) => {
      if (!destination) {
        return reject(new Error('Missing the destination for ChartMogul API'));
      }

      if (!destination.startsWith('/')) {
        destination = '/' + destination;
      }
      request.get(Config.chartmogul.apiUrl + destination)
        .auth(Config.chartmogul.apiToken, Config.chartmogul.apiSecret)
        .query(query)
        .end((err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res.body);
        });
    });
  }


  /**
   * Config the request for ChartMogul depending on theparams received.
   *
   * @param {any} req - The request
   * @param {any} res - The response
   * @param {any} next - The next middleware to call.
   *
   * @memberOf ChartMogulFeed
   */
  configByParams(req, res, next) {
    res.locals.config.
    next();
  }

  /**
   * The firstMiddleware where the request must go first.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  firstMiddleware(req, res, next) {
    next();
  }

  /**
   * The middleware in charge of fetching the MRR.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchMrr(req, res, next) {
    this.requestChartMogulFor('/metrics/mrr', res.locals.config);
    next();
  }

}


// -------------------------------------------------------------------
// Exports
module.exports = ChartMogulFeed;
