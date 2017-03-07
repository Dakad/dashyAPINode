const Config = require('config');

exports = module.exports = [{
    /**
     * regular expression of URL
     */
    pattern: 'https://api.pipedrive.mock/v1(.*)',

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
      /**
       * Returning error codes example:
       *   request.get('https://api.pipedrive.mock/v1/404').end(function(err, res){
       *     console.log(err); // 404
       *     console.log(res.notFound); // true
       *   })
       */
      if (match[1] === '/404') {
        throw new Error(404);
      }


      if (match[1].startsWith('/pipelines')) {
        return Config.request.pipedrive.get('pipelines');
      }

      if (match[1].startsWith('/stages')) {
        return Config.request.pipedrive.stages;
      }


      /**
       * Checking on headers example:
       *   request.get('https://api.pipedrive.mock/v1/authorized_endpoint')
       *          .set({Authorization: "9382hfih1834h"})
       *          .end(function(err, res){
       *            console.log(res.body); // "Authenticated!"
       *          })
       */

      if (match[1] === '/authorized_endpoint') {
        if (headers['Authorization']) {
          return 'Authenticated!';
        } else {
          throw new Error(401); // Unauthorized
        }
      }

      /**
       * Cancelling the mocking for a specific matched route example:
       */
      if (match[1] === '/server_test') {
        // This will cancel the mock process and continue as usual (unmocked)
        context.cancel = true;
        return null;
      }

      /**
       * Delaying the response with a specific number of milliseconds:
       */
      if (match[1] === '/delay_test') {
        context.delay = 3000; // This will delay the response by 3 seconds
        return 'zzZ';
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
          'data': data,
          'success': true,
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
