const {request} = require('config');

const {hashCode} = require('../components/util');

const extractParamsFromQuery = function convert(str = '') {
  return str.substr(1).split('&')
    .map((q) => q.split('='))
    .reduce((params, q) => {
      params[q[0]] = q[1];
      return params;
    }, {});
};

exports = module.exports = [{
  /**
   * regular expression of URL
   */
  pattern: /https:\/\/api.chartmogul.mock\/v1(\/[\w]*[^/?])(\/[\w-]*)?(\?.*)?/,

  /**
   * returns the data
   *
   * @param {array} match Result of the resolution of the regular expression
   * @param {object|String|array} params sent by 'send' function
   * @param  {object|String|array} headers set by 'set' function
   * @param  {object|String|array} context the context of fixtures()
   * @return {void} nada
   */
  fixtures: function(match, params, headers, context) {
    // Firstly, check if the request is authenticated
    if (!headers['Authorization']) {
      throw new Error(401); // Unauthorized
    }

    let query = {};
    if (match[3]) {
      query = extractParamsFromQuery(match[3]);
    }

    if (match[1] === '/404') {
      throw new Error(404);
    }

    if(match[1].startsWith('/plans')) {
      return request.chartMogul.plans;
    }

    if (match[1].startsWith('/customers')) {
      if(match[2]) {
        const sub = match[2].replace('/', '');
        return request.chartMogul.subscriptions[sub];
      }
      const maxCustomers = request.chartMogul.customers.length;
      let {page = 1} = query;
      page = (page > maxCustomers) ? maxCustomers : page;

      // Put a delay because the amount of customers is huuuge
      // context.delay = 12000; // This will delay the response by 12 seconds
      return request.chartMogul.customers[page - 1];
    }

    if (match[1].startsWith('/metrics')) {
      switch (match[2]) {
        case '/mrr':
          return request.chartMogul.mrr;
        case '/mrr-churn-rate':
          return request.chartMogul.mrrChurnRate;
        case '/arr':
          return request.chartMogul.arr;
        case '/arpa':
          return request.chartMogul.arpa;
        case '/customer-count':
          if(query.plans) {
            const planHash = Math.abs(hashCode(query.plans));
            const nb = planHash % request.chartMogul.plans.plans.length;
            return request.chartMogul.customersCountForPlans[nb];
          }
          return request.chartMogul.customersCount;
        case '/all':
        default:
          return request.chartMogul.metrics;
      }
    }


    throw new Error(404);
  },

  /**
   *
   * @param {array} match Result of the resolution of the regular expression
   * @param {Object|string|array} data Data returns by `fixtures` attribute
   * @return {Object} the result of the GET request
   */
  get: function(match, data) {
    const copy = JSON.parse(JSON.stringify(data));
    return {
      body: Object.assign({}, copy),
    };
  },

  /**
   *
   * @param {array} match Result of the resolution of the regular expression
   * @param {Object|string|array} data Data returns by `fixtures` attribute
   * @return {Object} the result of the POST request
   */
  post: function(match, data) {
    return {
      code: 201,
    };
  },
},

];
