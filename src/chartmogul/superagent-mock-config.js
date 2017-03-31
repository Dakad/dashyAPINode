const Config = require('config');


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
  pattern: /https:\/\/api.chartmogul.mock\/v1(\/[\w]*[^/?])(\/[\w]*)?(\?.*)?/,

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


    if (match[1].startsWith('/customers')) {
      const maxCustomers = Config.request.chartMogul.customers.length;
      let {page = 1} = query;
      page = (page > maxCustomers) ? maxCustomers : page;

      // Put a delay because the amount of customers is huuuge
      // context.delay = 12000; // This will delay the response by 12 seconds
      return Config.request.chartMogul.customers[page - 1];
    }


    if (match[1].startsWith('/metrics')) {
      switch (match[2]) {
        case '/mrr':
          return Config.request.chartMogul.mrr;
        case '/mrr-churn-rate':
          return Config.request.chartMogul.mrrChurnRate;
        case '/arr':
          return Config.request.chartMogul.arr;
        case '/arpa':
          return Config.request.chartMogul.arpa;
        case '/customer-count':
          return Config.request.chartMogul.customersCount;
        case '/all':
        default:
          return Config.request.chartMogul.metrics;
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
