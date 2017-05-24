const {
  wootric,
  request,
} = require('config');

// const {hashCode} = require('../components/util');

const extractParamsFromQuery = function convert(str = '') {
  return str.split('&')
    .map((q) => q.split('='))
    .reduce((params, q) => {
      params[q[0]] = decodeURIComponent(q[1]);
      return params;
    }, {});
};

exports = module.exports = [
  {
    /**
     * regular expression of URL for the auth TOKen
     */
    pattern: /https:\/\/api.wootric.mock\/oauth\/token/,

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
      if (params) {
        const {
          'client_id': clId,
          'client_secret': clSecret,
          'grant_type': grant,
        } = params;
        if (grant === wootric.grantType) {
          if (clId === wootric.clientId && clSecret === wootric.clientSecret) {
            return request.wootric.auth;
          }
        }
      }

      throw new Error(400);
    },

    /**
     *
     * @param {array} match Result of the resolution of the regular expression
     * @param {Object|string|array} data Data returns by `fixtures` attribute
     * @return {Object} the result of the GET request
     */
    get: function(match, data) {
      // Is an Error 401
      return {
        body: {},
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
        body: data,
      };
    },
  },

  {
    /**
     * regular expression of URL
     */
    pattern: /https:\/\/api.wootric.mock\/v1\/(.*)\?(.*)/,

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


      if (!query['access_token']) {
        return '401-Login Required'; // Unauthorized
      } else {
        if (query['access_token'] !== request.wootric.auth.access_token) {
          return '401-Unauthorized Wrong token'; // Unauthorized
        }
      }

      if (match[1] == 'nps_summary') {
        return request.wootric['nps_summary'];
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
      if (typeof data === 'string') {
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
