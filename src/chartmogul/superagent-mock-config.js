const Config = require('config');


const extractParamsFromQuery = function convert(str ='') {
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
  pattern: /https:\/\/api.chartmogul.mock\/v1(\/[\w]*[^/])(\/[\w]*)?(\?.*)?/,

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
    let query;
    console.log();
    if (match[3]) {
      query = extractParamsFromQuery(match[3]);
    }

    if (match[1] === '/404') {
      throw new Error(404);
    }


    if (match[1].startsWith('/customers')) {
      return Config.request.chartmogul.get('customers');
    }


    if (match[1].startsWith('/metrics')) {
      if (match[2] === ('/mrr')) {
        return Config.request.chartmogul.mrr;
      }
      if (match[2] === '/arr') {
        return Config.request.chartmogul.arr;
      }
      if (match[2] === '/arpa') {
        return Config.request.chartmogul.arpa;
      }
      if (match[2] === '/customer-count') {
        return Config.request.chartmogul.customers;
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
    return {
      body: data,
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
