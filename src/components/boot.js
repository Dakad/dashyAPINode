'use strict';

/**
 * @fileoverview  The booting system for the app.
 * Can only be called by the main {@see main}.
 * Use promise to handle the async flow.
 *
 * @module  components/boot
 * @exports components/boot
 * @requires config
 * @requires bluebird
 * @requires fs
 * @requires ./components/logger
 * @requires ./components/server
 *
 *
 */

// -------------------------------------------------------------------
// Dependencies


// Import
const Config = require('config');
const Promise = require('bluebird');

// Built-in
const fs = require('fs');

// Mine
const Logger = require('./logger');
const Server = require('./server');

const BaseRouter = require('../base/baserouter');

const ChartMogulRouter = require('../chartmogul/chartmogul-route');
const ChartMogulFeed = require('../chartmogul/chartmogul-feed');

// -------------------------------------------------------------------
// Properties


/**
 * Routes Containers
 * @type {Array<Router>}
 * @private
 */
const routes_ = [
  BaseRouter.getInstance(),
  new ChartMogulRouter(new ChartMogulFeed()),

];

/**
 * Boot for the app.
 * If is Launch from the master process, call the init();
 *  -   Init the core component.
 *  -   Inject the dependencies into each component.
 *  -   Finally, just fork itself.
 *
 * Otherwise, just start the server (on the given or not) port in the config.
 * @name Boot
 * @private
 * @see components/boot
 */
class Boot {


  /**
   * Init the boot action.
   *
   * @static
   * @return {Promise} fullfied with nothing or reject with the error.
   */
  static start() {
    const server = new Server(Config.api.port);
    return new Promise(function(resolve, reject) {
      const checkIfSetup = (err, isDir) => {
        if (err || !isDir) {
          Logger.error('Logs Folder doesn\'t exist');
          Logger.error(err, `Please before continue, setup the app by 
                exec this cmd : make setup`);
          process.abort(); // Without the setup, musn't use the app.
          reject(err);
        }
        return true;
      };

      Logger.info('[BOOT]\t App is running');
      Promise.promisify(fs.stat)(Config.api.dirLogs).then(
        (stats) => checkIfSetup(null, stats.isDirectory()),
        (err) => checkIfSetup(err)
      ).then(() => {
        Logger.info('[BOOT]\t Check logs folder: OK');
        return server.init(routes_.map((rt) => rt.init()));
    }).then(function(app) {
      Logger.info('[BOOT]\t Init server : OK');
      Logger.info('[BOOT]\t Starting server .... ');
      return server.start();
    }).then(({address='localhost', port}) => {
      Logger.info('[SERVER]\t Server Ready');
      Logger.info(`[SERVER]\t Server Listening on http://${address}:${port}`);
      Logger.info('[BOOT]\t App ready');
      resolve();
    }).catch(function(err) {
      if (err.code === 'EADDRINUSE') {
        Logger.error('[SERVER]\t Address already in use');
      }
      Logger.error(err);
      reject(err);
      process.abort();
    });
  });
}

};


// -------------------------------------------------------------------
// Exports

module.exports = Boot;
