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
const Util = require('../components/util');

// -------------------------------------------------------------------
// Properties
const mrrsEntries = [
  {'entrie': 'mrr-new-business', 'label': 'New Business'},
  {'entrie': 'mrr-expansion', 'label': 'Expansion'},
  {'entrie': 'mrr-contraction', 'label': 'Contraction'},
  {'entrie': 'mrr-churn', 'label': 'Churn'},
  {'entrie': 'mrr-reactivation', 'label': 'Reactivation'},
];

/*
const ;
*/

/**
 * Feeder for ChartMogul route
 *
 * @class ChartMogulFeed
 * @extends {Feeder}
 */
class ChartMogulFeed extends Feeder {

  /**
   * Creates an instance of ChartMogulFeed.
   *
   * @memberOf ChartMogulFeed
   */
  constructor() {
    super();
    this.bestNetMRRMove_ = {
      'startDate': new Date('2014-09-01'),
      'val': 0,
    };
  }

  /**
   * Send a request to ChartMogul API.
   *
   * @param {string} destination - The pipedrive endpoint
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
          } else {
            return resolve(res.body);
          }
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
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    res.locals.config = {
      'start-date': Util.convertDate(today),
      'end-date': Util.convertDate(lastMonth),
      'interval': 'month',
    };
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
    this.requestChartMogulFor('/metrics/mrr', res.locals.config)
      .then((data) => {
        res.locals.data.item = [];

        // The mrr for today
        res.locals.data.item.push({
          'value': data.summary.current / 100,
        });

        // Take the last one because it'll be for the end of month

        res.locals.data.item.push({
          'value': data.summary.previous / 100,
        });

        next();
      })
      .catch((err) => next(err));
  }

  /**
   * The middleware in charge of fetching the customers count.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbCustomers(req, res, next) {
    this.requestChartMogulFor('/metrics/customer-count')
      .then((data) => {
        res.locals.data.item = [];

        res.locals.data.item.push({
          value: data.summary.current,
        });

        res.locals.data.item.push({
          value: data.summary.previous,
        });
        next();
      })
      .catch((err) => next(err));
  }


  /**
   * The middleware in charge of fetching the NET MRR Churn Rate.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRChurnRate(req, res, next) {
    this.requestChartMogulFor('/metrics/mrr-churn-rate')
      .then((data) => {
        res.locals.data.item = [];

        res.locals.data.item.push({
          value: data.summary.current,
        });

        res.locals.data.item.push({
          value: data.summary.previous,
        });
        next();
      })
      .catch(next);
  }


  /**
   * Calc. the NET MRR Movement.
   *
   * @param {Array<number>|Object} mrrs - Other MRRs
   *  {new-biz,expansion,contraction,churn}
   * @return {number} The NET MRR Movement
   * @memberOf ChartMogulFeed
   */
  calcNetMRRMovement(mrrs = []) {
    if (!mrrs) {
      return 0;
    }
    if (!Array.isArray(mrrs) && typeof mrrs === 'object') {
      // const allMrrEntries = mrrsEntries.map((mrr)=>mrr.entrie);
      // Keep only those required for the net mrr calc
      // Check if contains all mrrs required for the calc.
      mrrs = Object.keys(mrrs)
        .filter((key) => key.startsWith('mrr-'))
        // .every((key) => allMrrEntries.indexOf(key))
        .map((key) => mrrs[key]);
    }
    return (mrrs.reduce((net, mrr) => net = net + mrr, 0) / 100);
  }


  /**
   * Calc the NET MRR and return only the max
   *
   * @param {Array<Object>} entries - All entries.
   * @return {number} The MAX NET
   * @memberOf ChartMogulFeed
   */
  findMaxNetMRR(entries) {
    if (!Array.isArray(entries)) {
      throw new TypeError('Invalid arguements for entries - Must be an array');
    }
    entries.forEach((entry) => {
      const netMrr = this.calcNetMRRMovement(entry);
      if(netMrr > this.bestNetMRRMove_.val) {
        Object.assign(this.bestNetMRRMove_, {
          'startDate': entry.date,
          'val': netMrr,
        });
      }
    });
    return this.bestNetMRRMove_.val;
  }

  /**
   * THe middleware inf charge of fetching and calc the NET MRR Movements
   * based on others MRR Movements.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRMovements(req, res, next) {
    this.requestChartMogulFor('/metrics/mrr');
    next();
  }

  /**
   * THe middleware inf charge of fetching the other MRR Movements.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchMRRMovements(req, res, next) {
    this.requestChartMogulFor('/metrics/mrr')
      .then((data) => {
        const otherMrr = data.entries.pop();

        /*
        const items = mrrsEntries.map(function createItems(item) {
          return {
            label: item.label, value: otherMrr[item.entrie]/100,
          };
        });
      */
        Object.assign(res.locals.data, {
          'format': 'currency',
          'unit': 'EUR',
          'items': mrrsEntries.map((item) => ({
            'label': item.label,
            'value': otherMrr[item.entrie] / 100,
          })),
        });

        next();
      })
      .catch(next);
  }


  /**
   * The middleware in charge of fetching the ARR.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchArr(req, res, next) {
    this.requestChartMogulFor('/metrics/arr')
      .then((data) => {
        res.locals.data.item = [];

        res.locals.data.item.push({
          value: data.summary.current / 100,
        });

        res.locals.data.item.push({
          value: data.summary.previous / 100,
        });
        next();
      })
      .catch(next);
  }

  /**
   * The middleware in charge of fetching the ARPA.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchArpa(req, res, next) {
    this.requestChartMogulFor('/metrics/arpa')
      .then((data) => {
        res.locals.data.item = [];

        res.locals.data.item.push({
          value: data.summary.current / 100,
        });

        res.locals.data.item.push({
          value: data.summary.previous / 100,
        });
        next();
      })
      .catch(next);
  }


}

// -------------------------------------------------------------------
// Exports
module.exports = ChartMogulFeed;
