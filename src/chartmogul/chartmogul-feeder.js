/**
 * @overview Feeder for the chartmogul router.
 *
 * @module feeder/chartmogul
 * @requires config @see https:google.com
 * @requires bluebird
 * @requires superagent
 *
 * @requires components/feeder
 * @requires components/util
 * @requires formatter/gecko
 * @requires formatter/html/chartmogul
 *
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
const GeckoFormatter = require('../components/gecko-formatter');

const HTMLFormatter = require('./chartmogul-format-html');


// -------------------------------------------------------------------
// Properties

/** @constant {string} KEY_NB_LEADS_LAST_MONTH
 * The key for the nbLeads in the cache
 * @private */
const KEY_NB_LEADS_LAST_MONTH = 'nbLeadsLastMonth';

/** @constant {string} KEY_AVG_LEADS_LAST_MONTH
 * The key for the last Month AVG in the cache
 * @private */
const KEY_AVG_LEADS_LAST_MONTH = 'avgLeadsLastMonth';

/** @constant {string} KEY_BIGGEST_PLANS
 * The key for the biggest plans in the cache
 * @private */
const KEY_BIGGEST_PLANS = '5BiggestPlansPerCustomers';


const mrrsEntries = [{
    'entrie': 'mrr-new-business',
    'label': 'New Business',
  },
  {
    'entrie': 'mrr-expansion',
    'label': 'Expansion',
  },
  {
    'entrie': 'mrr-contraction',
    'label': 'Contraction',
  },
  {
    'entrie': 'mrr-churn',
    'label': 'Churn',
  },
  {
    'entrie': 'mrr-reactivation',
    'label': 'Reactivation',
  },
];

/**
 * @const {Object} requiredKeys The only to keeps from customers data.
 * @private
 * */
const leadsNecessaryKeys = [
  'name', 'status', 'company',
  'country', 'state', 'city', 'address',
  'customer-since', 'lead_created_at', 'free_trial_started_at',
  'mrr', 'uuid',
];

/**
 * Feeder for ChartMogul route
 *
 * @extends module:components/feeder~Feeder
 */
class ChartMogulFeeder extends Feeder {

  /**
   * Creates an instance of ChartMogulFeeder.
   *
   */
  constructor() {
    super(Config.chartMogul.apiUrl);

    this.bestNetMRR_ = {
      'lastFetch': null,
      'startDate': new Date(Config.chartMogul.bestNetMRR.startDate),
      'val': 0,
    };

    this.leads_ = {
      'lastFetch': null,
      'startPage': Config.chartMogul.leads.startPage,
    };

    this.customers_ = {
      'lastFetch': null,
      'startPage': Config.chartMogul.customers.startPage,
    };
  }


  /** @override */
  cacheResponse(key, resp) {
    if (Util.isEmptyOrNull(key)) {
      return resp;
    }

    switch (key.destination) {
      default: break;
      case '/customers':
          if (resp.has_more) {
          super.setInCache(key, resp);
        }
        break;
      case '/plans':
          const plans = resp.plans
          .filter((plan, i, plans) => { // Remove duplicate Plan
            return plans.findIndex((p) => (p.name === plan.name)) === i;
          })
          .map((plan) => ({
            'external_id': plan.external_id,
            'name': plan.name.trim(),
            'uuid': plan.uuid,
          }));
        super.setInCache(key, plans);
        return plans;
    }
    return resp;
  }

  /**
   * Send a request to ChartMogul API.
   *
   * @param {string} destination - Which ChartMogul endpoint
   * @param {Object} query - The query params to send to ChartMogul
   * @return {Promise}
   *
   */
  async requestChartMogulFor(destination, query) {
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

    // Get The cached response for this request
    const resCached = await super.getCached(key);
    if (resCached !== null) {
      return resCached;
    }
    // No cached response for this request
    // return this.requestAPI(destination, query, key);
    if (!destination) {
      throw new Error('Missing the destination for ChartMogul API');
    }

    try {
      // Send my Request to ChartMogul API
      const {
        body,
      } = await request.get(Config.chartMogul.apiUrl + destination)
        .auth(Config.chartMogul.apiToken, Config.chartMogul.apiSecret)
        .query(query);
      // Any-way, check if this resp must be stored in cache
      // Send back the processed|transformed resp for cache
      // Otherwise, will send back res.body
      return this.cacheResponse(key, body);
    } catch (err) {
      throw err;
    }
  }


  /**
   * Perfom a filtering on the customers[].
   *
   * @private
   * @param {Array<Object>} customers
   * @param {boolean} [onlyLead=false] - Which kind of customer must be kept.
   * @return {Array<Object>} All customers filtered.
   *
   */
  filterCustomers(customers, onlyLead = false) {
    if (!Array.isArray(customers)) {
      return [];
    }

    const lastMonthDate = Util.getAllDates('firstInPastMonth');
    lastMonthDate.setHours(0, 0, 0, 0);

    return customers
      .filter((customer) => {
        // ? Has Cancelled or never been a lead ?
        if (onlyLead) {
          // if (customer.status === 'Cancelled' ||
          if (!customer['lead_created_at']) {
            return false;
          }
          const leadDate = new Date(customer['lead_created_at']).getTime();
          return (leadDate >= lastMonthDate.getTime());
        }
        const customerDate = new Date(customer['customer-since']).getTime();
        return (customerDate >= lastMonthDate.getTime());
      })
      .map((entry) => {
        return leadsNecessaryKeys.reduce((nEntry, key) => {
          nEntry[key] = entry[key];
          return nEntry;
        }, {});
      });
  }

  /**
   *
   * Recursive fetcher for the customers or leads.
   *
   * @private
   *
   * @param {number} [startingPage=1] - The page to go fetch.
   * @param {Object} [opts] - Options for the fetch and filter.
   * @param {String} [opts.onlyLead=false] -  Keep only those leads.
   * @param {string} opts.status - Get only those {Active or Lead}
   *
   * @return {Array<Object>} - All customers||leads filtered.
   *
   */
  async fetchAndFilterCustomers(startingPage = 1, opts = {}) {
    const {
      onlyLead = false, status,
    } = opts;
    const reqCustomers = await this.requestChartMogulFor('/customers', {
      page: startingPage,
      status: status,
    });

    const filtered = this.filterCustomers(
      reqCustomers.entries, (onlyLead || (status && status === 'Lead'))
    );
    if (reqCustomers.has_more) {
      const values = await this.fetchAndFilterCustomers(startingPage + 1, opts);
      return values.concat(filtered);
    }
    return filtered;
  }


  /**
   * The middleware in chargin of fetch the leads.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch.
   *
   */
  async fetchNbLeads(config) {
    // The first day in this month at 00:00:00:00
    const {
      firstInMonth, firstInPastMonth, dateInPastMonth,
    } = Util.getAllDates();
    firstInMonth.setHours(0, 0, 0, 0);
    // The first day in the prev. month at 00:00:00:00
    firstInPastMonth.setHours(0, 0, 0, 0);

    const [leads, nbLastMonth] = await Promise.all([
      this.fetchAndFilterCustomers(this.leads_.startPage, {
        onlyLead: true,
      }),
      this.getCached(KEY_NB_LEADS_LAST_MONTH),
    ]);

    // console.log('Nb Filtered : ' + leads.length, nbLastMonth);
    const item = leads.reduce((item, lead) => {
      // const leadDate = Util.convertDate(lead['lead_created_at']);
      const leadDateInMs = new Date(lead['lead_created_at']).getTime();

      if (leadDateInMs >= firstInMonth) {
        item[0].value += 1;
      }
      // ? No cached value for the lastMonth ?
      if (nbLastMonth === null
        // Only the Leads made within the previous month
        &&
        leadDateInMs >= firstInPastMonth &&
        leadDateInMs <= dateInPastMonth) {
        item[1].value += 1;
      }
      return item;
    }, [{
        'value': 0,
      },
      {
        'value': (nbLastMonth) ? Number.parseInt(nbLastMonth) : 0,
      },
    ]);

    if (nbLastMonth === null) { // ? Nothing in cache ?
      super.setInCache(KEY_NB_LEADS_LAST_MONTH, item[1].value);
    }

    return GeckoFormatter.toNumberAndSecondStat(item[0], item[1]);
  }


  /**
   * The middleware in chargin of fetch the leads for today.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch.
   *
   */
  async fetchNbLeadsToday(config) {
    const {today, last30Days} = Util.getAllDates();
    today.setHours(0, 0, 0, 0);
    last30Days.setHours(0, 0, 0, 0);

    const item = [{
        'value': 0,
        'absolute': true,
      },
      {
        'value': 0,
      },
    ];

    const [leads, avgLeadsLastMonth] = await Promise.all([
      this.fetchAndFilterCustomers(1, {
        onlyLead: true,
      }),
      this.getCached(KEY_AVG_LEADS_LAST_MONTH),
    ]);
    // console.log('Nb Filtered : ' + leads.length, avgLeadsLastMonth);
    leads.forEach((lead) => {
      // const leadDate = Util.convertDate(lead['lead_created_at']);
      // console.log('Lead : '+leadDate);
      const leadDateInMs = new Date(lead['lead_created_at']).getTime();

      if (leadDateInMs >= today.getTime()) {
        item[0].value += 1;
      }
      if (avgLeadsLastMonth === null
        // Only the Leads made within the previous month
        &&
        leadDateInMs >= last30Days.getTime() &&
        leadDateInMs < today.getTime()) {
        item[1].value += 1;
      }
    });

    if (avgLeadsLastMonth === null) {
      // Calc the avg on 30 days
      item[1].value = Math.round(item[1].value / 30);
      super.setInCache(KEY_AVG_LEADS_LAST_MONTH, item[1].value);
    } else {
      item[1].value = avgLeadsLastMonth;
    }
    return GeckoFormatter.toNumberAndSecondStat(item[0], item[1]);
  }


  /**
   * The middleware in charge of fetching the MRR.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} - The promisified geckoFormatted result of the fetch
   *
   */
  async fetchMrr(config) {
    const req = await this.requestChartMogulFor('/metrics/mrr', config);
    const {
      entries: [previous, current],
    } = req;

    return GeckoFormatter.toNumberAndSecondStat({
      'value': Math.round(current.mrr / 100),
      'prefix': '€',
    }, { // Take the first one because it'll be for the end of month
      'value': Math.round(previous.mrr / 100),
    });
  }


  /**
   * The middleware in charge of fetching the customers count.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchNbCustomers(config) {
    const {
      entries: [previous, current],
    } = await this.requestChartMogulFor(
      '/metrics/customer-count',
      config
    );
    return GeckoFormatter.toNumberAndSecondStat({
      value: current['customers'],
    }, {
      value: previous['customers'],
    });
  }


  /**
   * The middleware in charge of fetching the NET MRR Churn Rate.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchNetMRRChurnRate(config) {
    const {
      entries: [previous, current],
    } = await this.requestChartMogulFor(
      '/metrics/mrr-churn-rate',
      config
    );
    return GeckoFormatter.toNumberAndSecondStat({
      reverse: true,
      prefix: '%',
      value: current['mrr-churn-rate'],
    }, {
      value: previous['mrr-churn-rate'],
    });
  }


  /**
   * Calc. the NET MRR.
   *
   * @private
   *
   * @param {Array<number>|Object} mrrs - Other MRRs
   *  {new-biz,expansion,contraction,churn}
   *
   * @return {number} - The NET MRR
   *
   */
  calcNetMRR(mrrs = []) {
    if (!mrrs) {
      return 0;
    }
    if (!Array.isArray(mrrs) && typeof mrrs === 'object') {
      // Keep only those required for the net mrr calc
      mrrs = Object.keys(mrrs)
        .filter((key) => key.startsWith('mrr-'))
        .map((key) => mrrs[key]);
    }
    return (mrrs.reduce((net, mrr) => net + mrr, 0) / 100);
  }


  /**
   * Calc the NET MRR and return only the max
   *
   * @private
   *
   * @param {Array<Object>} mrrs - MRR Values.
   *
   * @return {number} - The MAX NET
   *
   */
  findMaxNetMRR(mrrs) {
    if (!Array.isArray(mrrs)) {
      throw new TypeError('Invalid arguements for mrrs - Must be an array');
    }
    // Calc & Find the max netMRR within mrrs
    mrrs.forEach((mrr) => {
      const netMrr = this.calcNetMRR(mrr);
      if (netMrr > this.bestNetMRR_.val) {
        Object.assign(this.bestNetMRR_, {
          'startDate': mrr.date,
          'val': netMrr,
        });
      }
    });
    return this.bestNetMRR_.val;
  }

  /**
   * THe middleware inf charge of fetching and calc the NET MRR Movements
   * based on others MRR Movements.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchNetMRRMovement(config) {
    // 1,000 ms * 60 secs * 60 mins * 24 hrs * 7 days
    const weekInMS = 1000 * 60 * 60 * 24 * 7;
    const hasFetchInWeek =
      (new Date().getTime() - new Date(this.bestNetMRR_.lastFetch).getTime()) <
      weekInMS;

    const {
      entries,
    } = await this.requestChartMogulFor('/metrics/mrr', {
      'start-date': Util.convertDate(this.bestNetMRR_.startDate),
      'end-date': config['end-date'],
      'interval': config['interval'],
    });

    // ? Never made the fetch for the max. ?
    if (!this.bestNetMRR_.lastFetch || this.bestNetMRR_.val === 0
      // ? Last fetch for the Max was more thna 1 weeek ago ?
      ||
      !hasFetchInWeek) {
      this.bestNetMRR_.lastFetch = new Date().getTime();
      this.findMaxNetMRR(entries);
    }

    const netMrr = this.calcNetMRR(entries.pop());
    return {
      'item': [{
        'text': HTMLFormatter.toTextNetMrr(
          Util.toMoneyFormat(netMrr, ',', '.'),
          Util.toMoneyFormat(this.bestNetMRR_.val, ',', '.')
        ),
      }],
    };
  }

  /**
   * THe middleware in charge of fetching the other MRR Movements.
   *
   * @param {Object} config - The config require for the fetch
   *
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchMRRMovements(config) {
    const {
      entries,
    } = await this.requestChartMogulFor('/metrics/mrr', {
      'start-date': config['start-date'],
      'end-date': config['end-date'],
      'interval': config['interval'],
    });

    const otherMrr = entries.pop();

    switch (config.out) {
      case 'list':
        const items = mrrsEntries.map((item) => [
          item.label,
          otherMrr[item.entrie] / 100,
        ]);
        return GeckoFormatter.toLeaderboard(items, 'currency', 'EUR');

      case 'html':
      default:
        const mrrMoves = mrrsEntries.map((item) => [
          item.label,
          otherMrr[item.entrie] / 100,
        ]);

        mrrMoves.pop();

        return {
          'item': [{
            'text': HTMLFormatter.toTextMRRMovements(mrrMoves),
          }],
        };
    }
  }

  /**
   * The middleware in charge of fetching the ARR.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchArr(config) {
    const {
      entries: [previous, current],
    } = await this.requestChartMogulFor(
      '/metrics/arr',
      config
    );
    return GeckoFormatter.toNumberAndSecondStat({
      value: Math.round(current.arr) / 100,
      prefix: '€',
    }, {
      value: Math.round(previous.arr) / 100,
    });
  }

  /**
   * The middleware in charge of fetching the ARPA.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchArpa(config) {
    const {
      entries: [previous, current],
    } = await this.requestChartMogulFor(
      '/metrics/arpa',
      config
    );
    return GeckoFormatter.toNumberAndSecondStat({
      value: Math.round(current.arpa / 100),
      prefix: '€',
    }, {
      value: Math.round(previous.arpa / 100),
    });
  }


  /**
   * The middleware in charge of fetching the Biggest Plans.
   *
   * @param {Object} config - The config require for the fetch
   * @return {Promise} The promisified geckoFormatted result of the fetch
   *
   */
  async fetchMostPlansPurchased(config) {
    // Recup all plans
    let keyForCache = KEY_BIGGEST_PLANS;

    let listPlans = await this.requestChartMogulFor('/plans');

    if (config.filter) {
      let filter = config.filter.toLowerCase();
      const onExclude = filter.startsWith('!');
      filter = (onExclude) ? filter.substr(1) : filter;

      keyForCache += filter;
      listPlans = listPlans.filter((p) => {
        const contains = p.name.toLowerCase().includes(filter);
        return (onExclude) ? !contains : contains;
      });
    }

    const [...customersCountByPlan] = await Promise.all(
      // For each plan, GET the customers' count with this plan
      listPlans.map((plan) => {
        return this.requestChartMogulFor('/metrics/customer-count', {
          'start-date': config['start-date'],
          'end-date': config['end-date'],
          'plans': plan.name,
        });
      })
    );

    let [lastBiggest, ...biggestCustByPlans] = await Promise.all([
      this.getCached(keyForCache),

      // Sum, filter & sort plansCustomerCount
      ...customersCountByPlan.map(({
        entries,
      }, i) => {
        return {
          'plan': listPlans[i],
          'total': entries.reduce((tot, {
            customers: c,
          }) => tot += c, 0),
        };
      }).filter(({
        total,
      }) => total > 1) // Keep out the customised plans
      .sort((p1, p2) => p2.total - p1.total)
      .slice(0, 5),
    ]);

    if (lastBiggest === null) { // First fresh fetch
      lastBiggest = [];
    }

    // Format the result for the LeaderBoard Widget
    const items = biggestCustByPlans.map(({
      total,
      plan,
    }) => {
      const item = {
        'label': plan.name,
        'value': total,
      };
      // Check the previous rank
      const prevRank = lastBiggest.findIndex(
        ({
          plan: old,
        }) => old.uuid === plan.uuid
      );

      if (prevRank !== -1) {
        // ? More Subscribers to this plan
        const diff = plan.total - lastBiggest[prevRank].total;
        if (diff > 0) {
          item['previous_rank'] = 10; // Move UP
          // 10 : Only 5 plans thus, the last one is Rank 10 (last position)
          // Set to 10 randomly, could have been [6 : Wiser choice :-)]
        } else {
          if (diff < 0) {
            item['previous_rank'] = 1; // Drop DOWN
          }
        }
      }
      return [item.label, item.value, item['previous_rank']];
    });

    this.setInCache(keyForCache, biggestCustByPlans);
    return GeckoFormatter.toLeaderboard(items);
  }


  /**
   * The middleware in charge of fetching the Latest Leads or Customers.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   */
  async fetchLatestCustomers(config) {
    const requestForCustomerPlan = async(uuid) => {
      let subscription = {};

      // Go fetch the subscriptions plans of those cust
      const dest = `/customers/${uuid}/subscriptions`;
      const {
        entries: subscriptions,
      } = await this.requestChartMogulFor(dest);
      if (!Util.isEmptyOrNull(subscriptions)) {
        subscription = subscriptions.pop();
      }
      return subscription;
    };

    // Convert to bool if other type then Bool
    const onlyLead = Boolean(config.onlyLead);
    
    let startingPage = (onlyLead) ?
      this.leads_.startPage : this.customers_.startPage;

    const leads = await this.fetchAndFilterCustomers(startingPage, {
      onlyLead: onlyLead,
      status: (onlyLead) ? 'Lead' : 'Active',
    });

    let latestLeads = leads
      .sort((cust1, cust2) => {
        const cust1DateTime = (onlyLead) ?
          cust1['lead_created_at'] :
          cust1['customer-since'];
        const cust2DateTime = (onlyLead) ?
          cust2['lead_created_at'] :
          cust2['customer-since'];

        const cmp = new Date(cust2DateTime).getTime() -
          new Date(cust1DateTime).getTime();
        return (cmp !== 0) ? cmp : cust2.mrr - cust1.mrr;
      })
      .slice(0, 5);

    if (!onlyLead) {
      // Go fetch the subscriptions plans of those cust
      for (let cust of latestLeads) {
        cust.plan = await requestForCustomerPlan(cust.uuid);
      }
    }

    latestLeads = latestLeads.map((cust, i) => {
      const when = new Date(
        (onlyLead) ?
        cust['lead_created_at'] :
        cust['customer-since']
      );

      if (config.out === 'json') {
        return {
          'country': cust.country,
          'country_full': Util.getCountryFromISOCode(cust.country),
          'name': cust.name,
          'company': cust.company,
          'date': when.toISOString(),
          'mrr': (!onlyLead) ? cust.mrr : undefined,
          'plan': cust.plan,
        };
      }

      return {
        'type': ((i === 0) ? 1 : 0),
        // 'text': (company || name)+' at '+
        //   new Date(cust.lead_created_at).toLocaleString('fr-FR')
        //   +' incomming MRR : '+Util.toMoneyFormat(mrr/100),
        'text': HTMLFormatter.toListCustomer({
          'who': cust.company || cust.name,
          'when': when,
          'where': cust.country,
          'city': cust.city,
          'mrr': (!onlyLead) ? cust.mrr : undefined,
          'plan': cust.plan,
        }),
      };
    });

    if (config.out === 'json') {
      return latestLeads;
    }

    return GeckoFormatter.toText(latestLeads);
  }


  /**
   * The middleware in charge of fetching the customers' countries.
   *
   * @param {Object} config The context of the request and response.
   * @return {Promise} the next middleware()
   *
   */
  async fetchCountriesByCustomers(config) {
    const customers = await this.fetchAndFilterCustomers(1, {
      status: 'Active',
    });

    const firstInMonth = new Date();

    if (firstInMonth.getDate() === 1) {
      firstInMonth.setDate(0); // Point it to end last month
    }

    firstInMonth.setDate(1);

    const tmpCountryCount = await customers.filter((cust) => {
        return new Date(cust['customer-since']).getTime() >=
          firstInMonth.getTime();
      })
      .reduce(
        (countryCount, {
          country,
        }) => {
          let count = countryCount[country];
          countryCount[country] = (!count) ? 1 : ++count;
          return countryCount;
        }, {}
      );


    if (config.out === 'json') {
      return tmpCountryCount;
    }

    const countryCount = Object.keys(tmpCountryCount)
      .sort((c1, c2) => tmpCountryCount[c2] - tmpCountryCount[c1])
      .slice(0, 4)
      .map((iso) => [iso, tmpCountryCount[iso]]);

    const html = HTMLFormatter.toTextMrrCountryCount(countryCount);
    return GeckoFormatter.toText(html);
  }


} // End of Class

// -------------------------------------------------------------------
// Exports

module.exports = ChartMogulFeeder;
