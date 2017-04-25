// const {request} = require('config');

// const {hashCode} = require('../components/util');

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
  pattern: /https:\/\/www.googleapis.mock\/analytics\/v3\/data\/ga(.*)/,

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
    const query = extractParamsFromQuery(match[1]);

    console.log(query);

    if(query.metrics == 'ga:newUsers') {

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
