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
     * @param {object} params sent by 'send' function
     * @param  {object} headers set by 'set' function
     * @param  {object} context the context of running the fixtures function
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
        return {'data': Config.request.pipedrive.get('pipelines')};
      }

      if (match[1].startsWith('/stages')) {
        return {'data': Config.request.pipedrive.stages};
      }


      /**
       * Checking on headers example:
       *   request.get('https://api.pipedrive.mock/v1/horized_endpoint').set({Authorization: "9382hfih1834h"}).end(function(err, res){
       *     console.log(res.body); // "Authenticated!"
       *   })
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
       *   request.get('https://api.pipedrive.mock/v1/ver_test').end(function(err, res){
       *     console.log(res.body); // (whatever the actual server would have returned)
       *   })
       */

      if (match[1] === '/server_test') {
        context.cancel = true; // This will cancel the mock process and continue as usual (unmocked)
        return null;
      }

      /**
       * Delaying the response with a specific number of milliseconds:
       *   request.get('https://api.pipedrive.mock/v1/ay_test').end(function(err, res){
       *     console.log(res.body); // This log will be written after the delay time has passed
       *   })
       */

      if (match[1] === '/delay_test') {
        context.delay = 3000; // This will delay the response by 3 seconds
        return 'zzZ';
      }

      /**
       * Mocking progress events:
       *   request.get('https://api.pipedrive.mock/v1/gress_test')
       *     .on('progress', function (e) { console.log(e.percent + '%'); })
       *     .end(function(err, res){
       *       console.log(res.body); // This log will be written after all progress events emitted
       *     })
       */

      if (match[1] === '/progress_test') {
        context.progress = {
          parts: 3, // The number of progress events to emit one after the other with linear progress
          //   (Meaning, loaded will be [total/parts])
          delay: 1000, // [optional] The delay of emitting each of the progress events by ms
          //   (default is 0 unless context.delay specified, then it's [delay/parts])
          total: 100, // [optional] The total as it will appear in the progress event (default is 100)
          lengthComputable: true, // [optional] The same as it will appear in the progress event (default is true)
          direction: 'upload', // [optional] superagent adds 'download'/'upload' direction to the event (default is 'upload')
        };
        return 'Hundred percent!';
      }
    },

    /**
     * returns the result of the GET request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    get: function(match, data) {
      return {
        body: data,
      };
    },

    /**
     * returns the result of the POST request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    post: function(match, data) {
      return {
        code: 201,
      };
    },
  },

];
