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

// npm package
const Config = require('config');
const Promise = require('bluebird');
// const ChartMogul = require('chartmogul-node');
const request = require('superagent');

// Built-in


// Mine
const Feeder = require('../components/feeder');
const Util = require('../components/util');
const Countries = require('../../config/countriesByISO-3166-alpha-2');

// -------------------------------------------------------------------
// Properties

/** @constant {Number} The key for the nbLeads in the cache */
const KEY_NB_LEADS_LAST_MONTH = 'nbLeadsLastMonth';

/** @constant {Number} The key for the last Month AVG in the cache */
const KEY_AVG_LEADS_LAST_MONTH = 'avgLeadsLastMonth';

/** @constant {Number} The key for the biggest plans in the cache */
const KEY_BIGGEST_PLANS = '5BiggestPlansPerCustomers';


const mrrsEntries = [
  {'entrie': 'mrr-new-business', 'label': 'New Business'},
  {'entrie': 'mrr-expansion', 'label': 'Expansion'},
  {'entrie': 'mrr-contraction', 'label': 'Contraction'},
  {'entrie': 'mrr-churn', 'label': 'Churn'},
  {'entrie': 'mrr-reactivation', 'label': 'Reactivation'},
];


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
    super(Config.chartMogul.apiUrl);
    // TODO Put this var in cache
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
        'mrr',
      ],
    };
  }


  /** @override */
  cacheResponse(key, resp) {
    if (Util.isEmptyOrNull(key)) {
      return;
    }

    switch (key.destination) {
      case '/customers':
        if (resp.has_more) {
          super.setInCache(key, resp);
        }
        break;
      case '/plans':
        super.setInCache(key, resp.plans.map((plan) => ({
          'external_id': plan.external_id,
          'name': plan.name,
          'uuid': plan.uuid,
        })));
      default:
        break;
    }
  }

  /**
   * Send a request to ChartMogul API.
   *
   * @param {string} destination - Which ChartMogul endpoint
   * @param {Object} query - The query params to send to ChartMogul
   * @return {Promise}
   *
   * @memberOf ChartMogulFeed
   */
  requestChartMogulFor(destination, query) {
    if (destination && !destination.startsWith('/')) {
      destination = '/' + destination;
    }
    // Create the key to be hash for REDIS
    const key = Object.assign({}, query, {
      'destination': destination,
      'start-date': undefined,
      'end-date': undefined,
      'interval': undefined,
    });

    return super.getCached(key) // Get The cached response for this request
      .then((resCached) => {
        if (resCached != null) {
          return resCached;
        }
        // No cached response for this request
        // return this.requestAPI(destination, query, key);
        return new Promise((resolve, reject) => {
          if (!destination) {
            return reject(
              new Error('Missing the destination for ChartMogul API')
            );
          }
          // Send my Request to ChartMogul API
          request.get(Config.chartMogul.apiUrl + destination)
            .auth(Config.chartMogul.apiToken, Config.chartMogul.apiSecret)
            .query(query)
            .end((err, res) => {
              if (err) {
                return reject(err);
              }
              this.cacheResponse(key, res.body);
              return resolve(res.body);
            });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // MUST KEEP THAT, cause the JS month start with 0
    // To avoid some bug if the month is January : 0
    const month = today.getMonth() + 1;
    const lastMonthDate = new Date(
      `${today.getFullYear()}-${month - 1}-1`)
      .getTime();

    return customers
      .filter((customer) => {
        // ? Has Cancelled or never been a lead ?
        if (onlyLead) {
          // if (customer.status === 'Cancelled' ||
          if (!customer['lead_created_at']) {
            return false;
          }
          const leadDate = new Date(customer['lead_created_at']).getTime();
          return (leadDate >= lastMonthDate);
        }
        const customerDate = new Date(customer['customer-since']).getTime();
        return (customerDate >= lastMonthDate);
      })
      .map((entry) => {
        return this.leads_.necessaryKeys.reduce((nEntry, key) => {
          nEntry[key] = entry[key];
          return nEntry;
        }, {});
      });
  }

  /**
   * Recursive fetcher for the customers or leads.
   * @private
   * @param {number} startingPage - The page to go fetch.
   * @param {boolean} [onlyLead=false] - Which kind of customer must be kept.
   * @return {Array<Object>} All customers||leads filtered.
   * @memberOf ChartMogulFeed
   */
  fetchAndFilterCustomers(startingPage=1, onlyLead = false) {
    return this.requestChartMogulFor('/customers', {
      page: startingPage,
      // status: (onlyLead) ? 'Lead' : 'Active',
    }).then(({entries, has_more: hasMore}) => {
      const filtered = this.filterCustomers(entries, onlyLead);
      if (hasMore) {
        return this.fetchAndFilterCustomers(startingPage + 1, onlyLead)
          .then((data) => data.concat(filtered));
      }
      // TODO Change the code for fetchNbLeads* to support the cache sys.
      // Save the last page for /customers
      // Henceforth, only to only call & filter this page
      // this.leads_.startPage = startingPage;
      return filtered;
    });
  }


  /**
   * The middleware in chargin of fetch the leads.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbLeads(config) {
    // The first day of the previous month
    // The last day of the previous month at 00:00:00:00
    const firstInMonth = new Date();
    firstInMonth.setDate(1);
    firstInMonth.setHours(0, 0, 0, 0);

    // Get the date for the end of the previous month
    let previousMonth = new Date();
    // Set the day to the first day.
    previousMonth.setDate(0);
    previousMonth.setDate(1);
    previousMonth.setHours(0, 0, 0, 0);

    return Promise.all([
      this.fetchAndFilterCustomers(this.leads_.startPage, true),
      this.getCached(KEY_NB_LEADS_LAST_MONTH),
    ]).then(([leads, nbLastMonth]) => {
      // console.log('Nb Filtered : ' + leads.length, nbLastMonth);
      const item = leads.reduce((item, lead) => {
        // const leadDate = Util.convertDate(lead['lead_created_at']);
        // console.log('Lead : '+leadDate);
        const leadDateInMs = new Date(lead['lead_created_at']).getTime();
        if (leadDateInMs >= firstInMonth) {
          item[0].value += 1;
        }
        // ? No cached value for the lastMonth ?
        if (nbLastMonth === null
          // Only the Leads made within the previous month
          && leadDateInMs >= previousMonth.getTime()
          && leadDateInMs < firstInMonth.getTime()) {
          item[1].value += 1;
        }
        return item;
      }, [
          {'value': 0},
          {'value': (nbLastMonth) ? Number.parseInt(nbLastMonth) : 0},
        ]);

      if (nbLastMonth === null) {
        super.setInCache(KEY_NB_LEADS_LAST_MONTH, item[1].value);
      }
      return item;
    });
  }


  /**
   * The middleware in chargin of fetch the leads for today.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbLeadsToday(config) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);
    last30Days.setHours(0, 0, 0, 0);

    const item = [
      {'value': 0},
      {'value': 0},
    ];

    return Promise.all(
      this.fetchAndFilterCustomers(this.leads_.startPage, true),
      this.getCached(KEY_AVG_LEADS_LAST_MONTH)
    ).then(([leads, avgLastMonth]) => {
      // console.log('Nb Filtered : ' + leads.length, avgLastMonth);
      leads.forEach((lead) => {
        // const leadDate = Util.convertDate(lead['lead_created_at']);
        // console.log('Lead : '+leadDate);
        const leadDateInMs = new Date(lead['lead_created_at']).getTime();

        if (leadDateInMs >= today) {
          item[0].value += 1;
        }
        if (avgLastMonth === null
          // Only the Leads made within the previous month
          && leadDateInMs >= last30Days.getTime()
          && leadDateInMs < today.getTime()) {
          item[1].value += 1;
        }
      });
      // Calc the avg on 30 days
      item[1].value = Math.round(item[1].value / 30);

      if (avgLeadsLastMonth === null) {
        super.setInCache(KEY_AVG_LEADS_LAST_MONTH, item[1].value);
      }
      return item;
    });
  }


  /**
   * The middleware in charge of fetching the MRR.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchMrr(config) {
    return this.requestChartMogulFor('/metrics/mrr', config)
      .then(({entries: [previous, current]}) => [
        // The mrr for today
        {
          'value': current.mrr / 100,
          'prefix': '€',
        },

        // Take the first one because it'll be for the end of month
        {
          'value': previous.mrr / 100,
        },
      ]);
  }

  /**
   * The middleware in charge of fetching the customers count.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNbCustomers(config) {
    return this.requestChartMogulFor('/metrics/customer-count', config)
      .then(({entries}) => {
        const [previous, current] = entries;
        return [
          {value: current['customers']},
          {value: previous['customers']},
        ];
      })
      ;
  }


  /**
   * The middleware in charge of fetching the NET MRR Churn Rate.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRChurnRate(config) {
    return this.requestChartMogulFor('/metrics/mrr-churn-rate', config)
      .then(({entries: [previous, current]}) => [
        {prefix: '%', value: current['mrr-churn-rate']},
        {value: previous['mrr-churn-rate']},
      ]);
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
   * @param {Array<Object>} mrrs - MRR Values.
   * @return {number} The MAX NET
   * @memberOf ChartMogulFeed
   */
  findMaxNetMRR(mrrs) {
    if (!Array.isArray(mrrs)) {
      throw new TypeError('Invalid arguements for mrrs - Must be an array');
    }

    mrrs.forEach((mrr) => {
      const netMrr = this.calcNetMRRMovement(mrr);
      if (netMrr > this.bestNetMRRMove_.val) {
        Object.assign(this.bestNetMRRMove_, {
          'startDate': mrr.date,
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
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchNetMRRMovement(config) {
    const query = {
      'start-date': Util.convertDate(this.bestNetMRRMove_.startDate),
      'end-date': Util.convertDate(),
      'interval': config['interval'],
    };
    return this.requestChartMogulFor('/metrics/mrr', query)
      .then(({entries}) => {
        // console.log(entries[entries.length - 1]);
        // Never made the fetch for the max.
        if (!this.bestNetMRRMove_.lastFetch || this.bestNetMRRMove_.val === 0) {
          this.bestNetMRRMove_.lastFetch = new Date().getTime();
          this.findMaxNetMRR(entries);
        }

        // TODO Refactor Only after a specific amount of time
        // {3 days, 1 week , only Monday}

        const netMrr = this.calcNetMRRMovement(entries.pop());
        const current = Util.toMoneyFormat(netMrr, '', ',');
        const best = Util.toMoneyFormat(this.bestNetMRRMove_.val, '', ',');
        return [{
          'text': `
            <p style="font-size:1.5em">${current.trim()}</p>
            <h1 style="font-size:1.5em;color:#1c99e3">${best.trim()}</h1>
            `,
        }];
      })
      ;
  }

  /**
     * THe middleware in charge of fetching the other MRR Movements.
     *
     * @param {Object} config The context of the request and response.
     * @return {Promise} the next middleware()
     *
     * @memberOf ChartMogulFeed
     */
  fetchMRRMovements(config) {
    return this.requestChartMogulFor('/metrics/mrr', config)
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
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchArr(config) {
    return this.requestChartMogulFor('/metrics/arr', config)
      .then(({entries: [previous, current]}) => {
        return [
          {value: current.arr / 100, prefix: '€'},
          {value: previous.arr / 100},
        ];
      });
  }

  /**
   * The middleware in charge of fetching the ARPA.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchArpa(config) {
    return this.requestChartMogulFor('/metrics/arpa', config)
      .then(({entries: [previous, current]}) => {
        return [
          {value: current.arpa / 100, prefix: '€'},
          {value: previous.arpa / 100},
        ];
      });
  }


  /**
   * The middleware in charge of fetching the Biggest Plans.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchMostPlansPurchased(config) {
    // Recup all plans
    return this.requestChartMogulFor('/plans')
      .then((listPlans) => {
        listPlans = (listPlans.plans) ? listPlans.plans : listPlans;
        // For each plan, GET the customers' count
        const customersCount = listPlans.map((plan) => {
          return this.requestChartMogulFor('/metrics/customer-count', {
            'start-date': config['start-date'],
            'end-date': config['end-date'],
            'plans': plan.name,
          });
        });
        return Promise.all([listPlans, ...customersCount]);
      }).then(([listPlans, ...customersCountByPlan]) => {
        // Count plansCustomerCount
        const biggestCustByPlans = customersCountByPlan
          .map(({entries}, i) => {
            return {
              'plan': listPlans[i],
              'total': entries.reduce((tot, {customers: c}) => tot += c, 0),
            };
          }).filter(({total}) => total > 1) // Keep out the customised plans
          .sort((p1, p2) => p2.total - p1.total)
          .slice(0, 5);
        return Promise.all([
          this.getCached(KEY_BIGGEST_PLANS),
          ...biggestCustByPlans,
        ]);
      }).then(([lastBiggest, ...biggestCustByPlans]) => {
        console.log(typeof lastBiggest);
        if (lastBiggest === null) { // First fresh fetch
          lastBiggest = [];
        }
        const items = biggestCustByPlans.map(({total, plan}, i) => {
          const item = {
            'title': {
              'text': plan.name,
            },
            'description': total + ' subscribers',
          };
          // First Position
          if (i === 0) {
            item.label = {
              'name': 'Best !',
              'color': '#88dd42',
            };
          }
          // Last one
          if (i === biggestCustByPlans.length - 1) {
            item.label = {
              'name': 'At least !',
              'color': '#155460',
            };
          }
          // Check the previous rank
          const prevRank = lastBiggest.findIndex(
            ({plan: old}, i) => {
              return old.uuid === plan.uuid;
            }
          );

          if (prevRank !== -1) {
            item['previous_rank'] = prevRank + 1;
          }
          return item;
        });
        this.setInCache(KEY_BIGGEST_PLANS, biggestCustByPlans);
        return items;
      });
  }


  /**
   * The middleware in charge of fetching the Lattest Leads or Customers.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  fetchLatestCustomers({onlyLead}) {
    const today = new Date().setHours(0, 0, 0, 0);
    return this.fetchAndFilterCustomers(this.leads_.startPage, onlyLead)
      .then((leads) => {
        return leads
          .filter((lead) => {
            const dte = (!onlyLead)
                  ? lead['lead_created_at']
                  : lead['customer-since'];
            return new Date(dte).getTime() >= today;
          })
          .slice(0, 5)
          .sort((ld1, ld2) => {
            const ld1DateTime = (onlyLead)
                ? ld1['lead_created_at']
                : ld1['customer-since'];
            const ld2DateTime = (onlyLead)
                ? ld2['lead_created_at']
                : ld2['customer-since'];

            const cmp = new Date(ld2DateTime).getTime() -
                        new Date(ld1DateTime).getTime();
            return (cmp !== 0) ? cmp : ld2.mrr - ld1.mrr;
          })
          .map(({company, name, country, mrr, lead_created_at}, i) => ({
            'type': ((i === 0) ? 1 : 0),
            // 'text': (company || name)+' at '+
            //   new Date(lead_created_at).toLocaleString('fr-FR')
            //   +' incomming MRR : '+Util.toMoneyFormat(mrr/100),
            'text': `<h1><strong><ins>${company || name}</ins></strong></h1>
              <h2>
                When ? : <strong><ins> ${new Date(lead_created_at)
                .toLocaleString('fr-BE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false,
                })}</ins></strong>
                </h2>
            <h2>
              Where ? : <strong><ins>${Countries[country]}</ins></strong>
            <h2><hr>${ (onlyLead) ?
            `<h3>MRR : <strong><ins>${Util.toMoneyFormat(mrr / 100)}
            </ins></strong></h3>`:''}`.replace(/[\r\n]/g, ''),
          }
          ));
      });
  }

} // End of Class

// -------------------------------------------------------------------
// Exports

module.exports = ChartMogulFeed;
