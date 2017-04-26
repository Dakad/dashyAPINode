// const {request} = require('config');

// const {hashCode} = require('../components/util');

const extractParamsFromQuery = function convert(str = '') {
  return str.split('&')
    .map((q) => q.split('='))
    .reduce((params, q) => {
      params[q[0]] = decodeURIComponent(q[1]);
      return params;
    }, {});
};

exports = module.exports = [{
    /**
     * regular expression of URL
     */
    pattern: /https:\/\/www.googleapis.mock(.*)\?(.*)/,

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
      const query = extractParamsFromQuery(match[2]);

      console.log(query);

      if (!query['access_token']) {
        return '401-Login Required'; // Unauthorized
      }

      // This will delay the response by 3 seconds
      context.delay = 800;


      if (query.metrics == 'ga:newUsers') {
        // return request.ga.newUsers;
        return {columnHeaders: [], totalsForAllResults: {}, rows: []};
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
      // Is an Error 401
      if(typeof data === 'string') {
        data = data.split('-');
        return {
          code: data[0],
          body: {
            'error': {
              'code': data[0],
              'message': data[1],
            },
          },
        };
      }
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
