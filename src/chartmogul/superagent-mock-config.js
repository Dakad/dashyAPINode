const Config = require('config');

exports = module.exports = [{
    /**
     * regular expression of URL
     */
    pattern: 'https://api.chartmogul.mock/v1(/.*)',

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

      if (match[1] === '/404') {
        throw new Error(404);
      }

      console.log(match);

      if (match[1].startsWith('/customers')) {
        return Config.request.chartmogul.get('customers');
      }


      if (match[1] === '/metrics') {
        if (match[2].startsWith('/mrr')) {
          return Config.request.chartmogul.get('mrr');
        }
        if (match[2].startsWith('/arr')) {
          return Config.request.chartmogul.get('arr');
        }
        if (match[2].startsWith('/arpa')) {
          return Config.request.chartmogul.get('arpa');
        }
        if (match[2].startsWith('/customer-count')) {
          return Config.request.chartmogul.get('customer');
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
        body: {
          'entries': data,
          'summary': {
            'current': 382,
            'previous': 379,
          },
          'hasMore': true,
        },
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
