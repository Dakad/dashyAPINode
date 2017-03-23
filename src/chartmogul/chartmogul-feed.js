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
   * Perfom a filtering on the customers[].
   *
   * @private
   * @param {Array<Object>} customers
   * @param {boolean} [onlyLead=false] - Which kind of customer must be kept.
   * @return {Array<Object>} All customers filtered.
   *
   * @memberOf ChartMogulFeed
   */
  filterCustomers(customers, onlyLead = false) {
    if (!Array.isArray(customers)) {
      return [];
    }

    const currentDate = new Date().getTime();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    let leadDate;
    let customerDate;

    return customers
      .filter((customer) => {
        if (customer.status === 'Cancelled' ||
          (onlyLead && !customer['lead_created_at'])
        ) {
          return false;
        }
        if (onlyLead && (customer.status === 'Lead')) {
          leadDate = new Date(customer['lead_created_at']).getTime();
          // If [ lastMonth <= lead <= today ]
          return (leadDate >= lastMonth.getTime()
            && leadDate <= currentDate);
        }
        customerDate = new Date(customer['customer-since']).getTime();
        return (customerDate >= lastMonth.getTime()
          && customerDate <= currentDate);
      })
      .map((entry) => {
        return this.leads_.necessaryKeys.reduce((nEntry, key) => {
          nEntry[key] = entry[key];
          return nEntry;
        }, {});
      });
  }

  /**
   * Recursive fetcher for the customers.
   * @private
   * @param {number} startingPage - The page to go fetch.
   * @param {boolean} [onlyLead=false] - Which kind of customer must be kept.
   * @return {Array<Object>} All customers filtered.
   * @memberOf ChartMogulFeed
   */
  fetchAndFilterCustomers(startingPage, onlyLead = false) {
    return this.requestChartMogulFor('/customers', {
      page: startingPage,
    }).then(({entries, has_more: hasMore}) => {
      const filtered = this.filterCustomers(entries, onlyLead);
      if (hasMore) {
        return this.fetchAndFilterCustomers(startingPage + 1, onlyLead)
          .then((data) => data.concat(filtered));
      }
      return filtered;
    });
  }


  /**
   * The middleware inf chargin of fetch the leads.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbLeads(config) {
    const today = config['start-date'];
    const lastMonth = config['end-date'];
    const item = [
      {'value': 0},
      {'value': 0},
    ];

    let leadDate;

    return this.fetchAndFilterCustomers(this.leads_.startPage, true)
      .then((leads) => {
        leads.forEach((lead) => {
          leadDate = lead['lead_created_at'].slice(0, 10);
          if (leadDate === today) {
            item[0].value += 1;
          }
          if (leadDate === lastMonth) {
            item[1].value += 1;
          }
        });

        return item;
      });
  }

  /**
   * The middleware in charge of fetching the MRR.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchMrr(config) {
    return this.requestChartMogulFor('/metrics/mrr', config)
      .then(({summary}) => {
        return [
          // The mrr for today
          {
            'value': summary.current / 100,
            'prefix': '€',
          },

          // Take the last one because it'll be for the end of month
          {
            'value': summary.previous / 100,
          },
        ];
      })
      ;
  }

  /**
   * The middleware in charge of fetching the customers count.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbCustomers(config) {
    return this.requestChartMogulFor('/metrics/customer-count')
      .then(({summary}) => {
        return [
          {value: summary.current},
          {value: summary.previous},
        ];
      })
      ;
  }


  /**
   * The middleware in charge of fetching the NET MRR Churn Rate.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRChurnRate(config) {
    return this.requestChartMogulFor('/metrics/mrr-churn-rate')
      .then(({summary}) => {
        return [
          {value: summary.current},
          {value: summary.previous},
        ];
      });
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
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRMovement(config) {
    const query = {
      'start-date': Util.convertDate(this.bestNetMRRMove_.startDate),
      'end-date': Util.convertDate(),
      'interval': 'month',
    };
    return this.requestChartMogulFor('/metrics/mrr', query)
      .then(({summary, entries}) => {
        // Never made the fetch for the max.
        if (!this.bestNetMRRMove_.lastFetch || this.bestNetMRRMove_.val === 0) {
          this.bestNetMRRMove_.lastFetch = new Date().getTime();
          this.findMaxNetMRR(entries);
        }

        // TODO Refactor Only after a specific amount of time
        // {3 days, 1 week , only Monday}

        const current = Util.toMoneyFormat(summary.current, '', ',');
        const best = Util.toMoneyFormat(this.bestNetMRRMove_.val, '', ',');
        return [{
          'text': `
            <p style="font-size:1.7em">${current}</p>
            <h1 style="font-size:1.7em;color:#1c99e3">${best}</h1>
            `,
        }];
      })
      ;
  }

  /**
   * THe middleware in charge of fetching the other MRR Movements.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchMRRMovements(config) {
    return this.requestChartMogulFor('/metrics/mrr')
      .then((data) => {
        const otherMrr = data.entries.pop();

        /*
        const items = mrrsEntries.map(function createItems(item) {
          return {
            label: item.label, value: otherMrr[item.entrie]/100,
          };
        });
      */
        return Object.assign({}, {
          'format': 'currency',
          'unit': 'EUR',
          'items': mrrsEntries.map((item) => ({
            'label': item.label,
            'value': otherMrr[item.entrie] / 100,
          })),
        });
      });
  }


  /**
   * The middleware in charge of fetching the ARR.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchArr(config) {
    return this.requestChartMogulFor('/metrics/arr')
      .then(({summary}) => {
        return [
          {value: summary.current / 100, prefix: '€'},
          {value: summary.previous / 100},
        ];
      });
  }

  /**
   * The middleware in charge of fetching the ARPA.
   *
   * @param {any} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchArpa(config) {
    return this.requestChartMogulFor('/metrics/arpa')
      .then(({summary}) => {
        return [
          {value: summary.current / 100, prefix: '€'},
          {value: summary.previous / 100},
        ];
      });
  }


}

// -------------------------------------------------------------------
// Exports
module.exports = ChartMogulFeed;
