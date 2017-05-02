/**
 * @overview Feeder for the chartmogul router.
 *
 * @requires config
 * @requires bluebird/Promise
 * @requires superagent
 *
 * @requires components/feeder
 * @module {Feeder} feeds/google-analytics
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
const HTMLFormatter = require('./ga-format-html');


// -------------------------------------------------------------------
// Properties

/** @private  @constant {String} The key for the nbLeads in the cache */
// const KEY_GA_TOKEN = 'GoogleAuthAccessToken';


/** @private The required query for the request to GA  */
const requiredKeysForQuery = [
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
class GoogleAnalyticsFeeder extends Feeder {


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
    if (!Util.isEmptyOrNull(key)) { // ? Defined a key for the store ?
      super.setInCache(key, resp);
    }

    return resp;
    // TODO Must implements the cacheResponse()
  }


  /**
   *
   * Hash the query to form a key for the cache.
   * Only hash the query if the end-date is not in the current month.
   *
   * @private
   *
   * @param {Object} q - The query params to be send.
   *
   * @return {string} - The corresponding hash or null.
   */
  hashQueryForKey(q) {
    if (Util.isEmptyOrNull(q)) {
      return null;
    }
    const firstInMonth = new Date();
    firstInMonth.setDate(1);

    const qEndDate = new Date(q['end-date']);

    if (qEndDate.getTime() <= firstInMonth.getTime()) {
      return Util.hashCode(q);
    }

    return null;
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
      return flat + ((!comb) ? '' : ((comb === 'OR') ? ',' : ';'));
    };
    return filters = filters.reduce((str, filter) => {
      return str + ((Array.isArray(filter)) ? flatFilter(filter) : filter);
    }, '');
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
   * Send a request to GoogleAnalytics API.
   *
   * @param {Object} query - The query params to send to GoogleAnalytics
   * @return {Promise}
   *
   * @memberOf ChartMogulFeed
   */
  async requestGAFor(query) {
    try {
      if (Util.isEmptyOrNull(query)) {
        throw new Error('Arguments:query must be defined');
      }

      // Check if got all required key into the query
      requiredKeysForQuery.forEach((requiredKey) => {
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
      if (Array.isArray(query.filters)) {
        query.filters = this.flatFilters(query.filters, query.filterCombinator);
      }

      // Add viewIDs
      query['ids'] = 'ga:' + ConfigGA.viewId;


      // Key to be hash for REDIS
      let keyForCache = this.hashQueryForKey(query);

      console.log(query, keyForCache);

      // Get The cached response for this request
      const cachedResp = await super.getCached(keyForCache);
      if (cachedResp != null) {
        return cachedResp;
      }

      query['access_token'] = await this.getAccessToken();

      // Sending the request to the API
      const {
        body: resp,
      } = await request.get(this.apiEndPoint_).query(query);

      // Send the resp to be cached if necessary.
      return this.cacheResponse(keyForCache, {
        'headers': resp.columnHeaders,
        'totals': resp.totalsForAllResults,
        'rows': resp.rows,
      });
    } catch (error) {
      const {
        response: res,
      } = error;
      if (res && res.body && res.body.error) {
        const resErr = res.body.error;
        Logger.error(resErr.code + ' - ' + resErr.message, resErr);
      } else {
        Logger.error(error);
      }
      throw error;
    }
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
    const metrics = ['ga:newUsers'];
    const filters = ['ga:visitorType', '=~', 'New'];

    const query = {
      'current': {
        'start-date': config['start-date'],
        'end-date': config['end-date'],
        metrics,
        filters,
      },
      'last': {
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        metrics,
        filters,
      },
    };

    const [{
      totals: current,
    }, {
      totals: last,
    }] = await Promise.all([
      this.requestGAFor(query.current),
      this.requestGAFor(query.last),

    ]);

    return {
      'item': [{
          'value': Number.parseInt(current[metrics[0]]),
        },
        {
          'value': Number.parseInt(last[metrics[0]]),
        },
      ],
    };
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
    const metrics = ['ga:avgSessionDuration'];
    const query = {
      'current': {
        'start-date': config['start-date'],
        'end-date': config['end-date'],
        metrics,
      },
      'last': {
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        metrics,
      },
    };

    const [{
      totals: current,
    }, {
      totals: last,
    }] = await Promise.all([
      this.requestGAFor(query.current),
      this.requestGAFor(query.last),

    ]);

    const firstRes = current[metrics[0]];
    const secondRes = last[metrics[0]];

    switch (config.out) {
      case 'html':
        return {
          'item': [{
            'text': HTMLFormatter.toTextForDuration(firstRes, secondRes),
          }],
        };

      default:
        return {
          'absolute': true,
          'item': [{
            'type': 'time_duration',
            'value': Number.parseFloat(firstRes) * 1000,
          }, {
            'type': 'time_duration',
            'value': Number.parseFloat(secondRes) * 1000,
          }],
        };

    }
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
    const metrics = ['ga:bounceRate'];

    const query = {
      'current': {
        'start-date': config['start-date'],
        'end-date': config['end-date'],
        metrics,
      },
      'last': {
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        metrics,
      },
    };

    const [{
      totals: current,
    }, {
      totals: last,
    }] = await Promise.all([
      this.requestGAFor(query.current),
      this.requestGAFor(query.last),
    ]);

    return {
      'absolute': true,
      'type': 'reverse',
      'item': [{
          'value': Math.round(Number.parseFloat(current[metrics[0]])),
          'prefix': '%',
        },
        {
          'value': Math.round(Number.parseFloat(last[metrics[0]])),
        },
      ],
    };
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
    const metrics = ['ga:pageviews'];
    const filters = ['ga:pagePathLevel1', '==', '/aso-blog/'];
    const sort = '-ga:pageviews';

    const query = {
      'current': {
        'start-date': config['start-date'],
        'end-date': config['end-date'],
        metrics,
        filters,
        sort,
      },
      'last': {
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        metrics,
        filters,
        sort,
      },
    };

    const [{
      totals: current,
    }, {
      totals: last,
    }] = await Promise.all([
      this.requestGAFor(query.current),
      this.requestGAFor(query.last),
    ]);

    return {
      'item': [{
          'value': Number.parseInt(current[metrics[0]]),
        },
        {
          'value': Number.parseInt(last[metrics[0]]),
        },
      ],
    };
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
  async fetchBlogPageDuration(config) {
    const metrics = ['ga:avgTimeOnPage'];
    const filters = ['ga:pagePathLevel1', '==', '/aso-blog/'];

    const query = {
      'current': {
        'start-date': config['start-date'],
        'end-date': config['end-date'],
        metrics,
        filters,
      },
      'last': {
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        metrics,
        filters,
      },
    };

    const [{
      totals: current,
    }, {
      totals: last,
    }] = await Promise.all([
      this.requestGAFor(query.current),
      this.requestGAFor(query.last),
    ]);

    const firstRes = current[metrics[0]];
    const secondRes = last[metrics[0]];

    switch (config.out) {
      case 'html':
        let diff = Number.parseFloat(firstRes) - Number.parseFloat(secondRes);
        return {
          'item': [{
            'text': HTMLFormatter.toTextForDuration(firstRes, diff),
          }],
        };
      default:
        return {
          'absolute': true,
          'item': [{
              'type': 'time_duration',
              'value': firstRes,
            },
            {
              'type': 'time_duration',
              'value': secondRes,
            },
          ],
        };

    }
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
    const metrics = ['ga:pageviews'];
    const dimensions = ['ga:pageTitle', 'ga:pagePath'];
    const filters = ['ga:pagePathLevel1', '==', '/aso-blog/'];

    let {
      rows: tops,
    } = await this.requestGAFor({
      'start-date': config['start-date'],
      'end-date': config['end-date'],
      'max-results': 10,
      'sort': '-ga:pageviews',
      metrics,
      dimensions,
      filters,
    });

    let oldTopValue = await Promise.all(tops.map(async([path]) => {
      return this.requestGAFor({
        'start-date': config['last-start-date'],
        'end-date': config['last-end-date'],
        'max-results': 1,
        'filters': ['ga:pagePath', '==', path],
        metrics,
        dimensions,
        filters,
      });
    }));

    // CANNOT be stored in cache coz the most post can change in the month.
    oldTopValue = oldTopValue.reduce((old, [path, title, nbViews]) => {
      old[path] = nbViews;
      return old;
    }, {});


    // Insert the old value into tops
    tops = tops.map(([path, title, nbViews]) => {
      return [path, title, nbViews, oldTopValue[path]];
    });

    switch (config.out) {
      default: return {
        'item': [{
          'text': HTMLFormatter.toTextForBlogPostViews(tops.slice(0, 4)),
        }],
      };

      case 'json':
        return tops.map(([path, title, nbViews, oldViews]) => ({
          'path': path,
          'post': title.replace(' - ASO Blog', ''),
          'views': nbViews,
          oldViews,
        }));

      case 'list':
          return {
          'items': tops.map(([, title, nbViews]) =>
            ({
              'label': title.replace(' - ASO Blog', ''),
              'value': nbViews,
            })
          ),
        };
    }
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
  async fetchBestAcquisitionSrc(config) {
    const [metrics, dimensions, filters] = [
      ['ga:newUsers'],
      ['ga:source'],
      ['ga:medium', '==', 'referral'],
    ];

    const {
      rows: tops,
    } = await this.requestGAFor({
      'start-date': config['start-date'],
      'end-date': config['end-date'],
      'max-results': 10,
      'sort': '-ga:newUsers',
      metrics,
      dimensions,
      filters,
    });

    switch (config.out) {
      default: return {
        'percentage': 'hide',
        'item': tops.map(([title, nbViews]) =>
          ({
            'label': title.replace(' - ASO Blog', ''),
            'value': Number.parseInt(nbViews),
          })
        ),
      };

      case 'list':
          return {
          'item': [{
            'text': HTMLFormatter.toTextForBlogPostViews(tops.slice(0, 5)),
          }],
        };

      case 'json':
          return tops.map(([title, nbViews]) => {
          return {
            'source': title,
            'newUsers': nbViews,
          };
        });

    }
  }


} // End of Class

// -------------------------------------------------------------------
// Exports

module.exports = GoogleAnalyticsFeeder;
