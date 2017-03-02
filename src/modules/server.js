'use strict';

/**
 * Modules for the server.
 * Init the server by setting all necessary middlewares
 * Start the server.
 *
 */

// -------------------------------------------------------------------
// Modules dependencies


// npm
const Promise = require('bluebird');
const express = require('express');
const morgan = require('morgan');

// Built-in


// Mine
const Logger = require('./logger');


// -------------------------------------------------------------------
// Module' Exports

module.exports = class Server {

  /**
   * Init the server by setting all his middlewares :
   *  - Morgan to log the request
   *
   * @static
   * @param {Number} port - Wich port to listen to.
   * @return {Promise} a fullfied promise containing the app instance.
   */
  static init(port) {
    return new Promise(function(resolve, reject) {
      const _app = express();
      _app.set('port', port);
      _app.use(morgan('short', {
        skip: (req, res, next) => res.statusCode < 400,
        stream: Logger.stream,
      }));

      // _app.use(Router.init());
      resolve(_app);
    });
  }

  /**
   * Start the server.
   *  - Listen to the specified port.
   *  - Attach all necessary listener.
   *
   * @static
   * @param {any} app : The Init server #(Server.init())
   * @return {Promise}
   *  - a fullfied containing the server address.
   *  - a rejected with a friendly error message.
   */
  static start(app) {
    return new Promise(function(resolve, reject) {
      const server = app.listen(app.get('port'));
      server.on('listening', (err) => {
        return resolve(server.address());
      });
      server.on('close', () => Logger.warn('Missing fct to close the server'));
      server.on('error', function onError(err) {
        if (err.syscall !== 'listen') {
          throw err; // Wasn't listen yet !
        }
        // handle specific listen errors with friendly messages
        let errMsg = undefined;
        switch (err.code) {
          case 'EACCES':
            errMsg ='Port :' + app.get('port') + ' need to be admin';
            break;
          case 'EADDRINUSE':
            errMsg ='Port :' + app.get('port') + ' is already in use.\n';
            break;
          default:
          errMsg = err.message;
        }
        reject(new Error(errMsg, err));
      });
    });
  }
};
