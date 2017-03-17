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
    /** @private */
    this.bestNetMRRMove_ = {
      'lastFetch': null,
      'startDate': new Date(Config.chartMogul.bestNetMRR.startDate),
      'val': 0,
    };
    /** @private */
    this.leads_ = {
      'lastFetch': null,
      'startPage': Config.chartMogul.leads.startPage,
      'necessaryKeys': [
        'name',
        'status',
        'customer-since',
        'company',
        'country',
        'state',
        'city',
        'lead_created_at',
        'free_trial_started_at',
        'address',
      ],
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
      request.get(Config.chartMogul.apiUrl + destination)
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
   * Recursive fetcher for the customers.
   * @private
   * @param {number} startingPage - The page to go fetch.
   * @param {boolean} onlyLead - What kind of customer must be retained.
   * @return {Array<Object>} All customers filtered.
   * @memberOf ChartMogulFeed
   */
  fetchAndFilterCustomers(startingPage, onlyLead = false) {
    const currentDate = new Date().getTime();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return this.requestChartMogulFor('/customers', {
      page: startingPage,
    }).then((data) => {
      if (data.hasMore) {
        return this.fetchAndFilterCustomers(data.page++, onlyLead);
      }
      return data.entries;
    }).then((entries) => {
      let leadDate;
      let isLead = false;
      let isInRange = false;
      let newEntry;
      entries
        .filter((entry, i) => {
          leadDate = new Date(entry['lead_created_at']).getTime();
          isLead = (entry.status === 'Lead');
          // If the entry is in range (lastMonth && today)
          isInRange = (leadDate >= lastMonth.getTime()
            && leadDate <= currentDate);
          return (onlyLead) ? isLead && isInRange : isInRange;
        })
        .map((entry) => {
          newEntry = this.leads_.necessaryKeys.reduce((nEntry, key)=>{
            nEntry[key] = entry[key];
            return nEntry;
          }, {});
          return Object.assign({}, newEntry);
        });
    });
  }


  /**
   * The middleware inf chargin of fetch the leads.
   *
   * @param {any} req
   * @param {any} res
   * @param {any} next
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbLeads(req, res, next) {
    this.requestChartMogulFor('/customers', {
      'page': this.leads_.startPage,
    }).then((data) => {
      next();
    }).catch(next);
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
   * @private
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
   * @private
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
      if (netMrr > this.bestNetMRRMove_.val) {
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
    const query = {
      'start-date': Util.convertDate(this.bestNetMRRMove_.startDate),
      'end-date': Util.convertDate(),
      'interval': 'month',
    };
    this.reqCharMogul = this.requestChartMogulFor('/metrics/mrr', query)
      .then(({summary, entries}) => {
        // Never made the fetch for the max.
        if (!this.bestNetMRRMove_.lastFetch || this.bestNetMRRMove_.val === 0) {
          this.bestNetMRRMove_.lastFetch = new Date().getTime();
          this.findMaxNetMRR(entries);
        }

        // TODO Only after a specific amount of time
        // {3 days, 1 week , only Monday}

        const current = Util.toMoneyFormat(summary.current, '', ',');
        const best = Util.toMoneyFormat(this.bestNetMRRMove_.val, '', ',');
        res.locals.data.item = [{
          'text': `
            <p style="font-size:1.7em">${current}</p>
            <h1 style="font-size:1.7em;color:#1c99e3">${best}</h1>
            `,
        }];
        next();
      })
      .catch(next);
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
