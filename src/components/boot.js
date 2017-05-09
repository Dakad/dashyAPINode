'use strict';

/**
 * @fileoverview  The booting module for the app.
 * Can only be called by the main {@see main}.
 * Use promise to handle the async flow.
 *
 * @module  components/boot
 * @exports components/boot
 * @requires config
 * @requires bluebird
 * @requires fs
 * @requires components/logger
 * @requires components/server
 *
 *
 */

// -------------------------------------------------------------------
// Dependencies


// npm
const Config = require('config');
const Promise = require('bluebird');

// Built-in
const fs = require('fs');

// Mine
const Logger = require('./logger');
const Server = require('./server');

const BaseRouter = require('../base/baserouter');

const ChartMogulRouter = require('../chartmogul/chartmogul-router');
const ChartMogulFeeder = require('../chartmogul/chartmogul-feeder');

const GARouter = require('../google_analytics/ga-router');
const GAFeeder = require('../google_analytics/ga-feeder');

// -------------------------------------------------------------------
// Properties


/**
 * Routes Containers
 * @type {Array<Router>} routers - All routers handled by servers
 *  with their feeder.
 * @private
 */
const routes_ = [
  BaseRouter.getInstance(),
  new ChartMogulRouter(new ChartMogulFeeder()),
  new GARouter(new GAFeeder()),
];


/**
 * Callback for check if the logs folder is created.
 * @param {Error} err - The provided error by fs.stat()
 * @param {Boolean} isDir - If is directory or not
 * @return {Boolean} **true** if created otherwise throw an err.
 * @throws {Error} Stats Error
 */
const checkIfSetup = (err, isDir) => {
  if (err || !isDir) {
    Logger.error('Logs Folder doesn\'t exist');
    Logger.error('Please before continue, setup the app by' +
      +' exec this cmd : make setup');
    throw err;
  }
  return true;
};


/**
 * Boot for the app.
 * If is Launch from the master process, call the init();
 *  -   Init the core component.
 *  -   Inject the dependencies into each component.
 *  -   Finally, just fork itself.
 *
 * Otherwise, just start the server (on the given or not) port in the config.
 * @see components/boot
 */
class Boot {

  /**
   * Init the boot action.
   *
   * @return {Promise} pending with nothing or reject with the error.
   */
  static async start() {
    const server = new Server(Config.api.port);
    let stats;

    try {
      Logger.info('[BOOT]\t App is running');

      try {
        stats = await Promise.promisify(fs.stat)(Config.api.dirLogs);
        checkIfSetup(null, stats.isDirectory()); // Log an error msg if not.
      } catch (err) {
        checkIfSetup(err); // Must produce the same error msg for an error
      }
      Logger.info('[BOOT]\t Check logs folder: OK');

      const app = await server.init(routes_.map((rt) => rt.init()));
      Logger.info('[BOOT]\t Init Routes for server : OK');

      Logger.info('[BOOT]\t Starting server .... ');
      const {
        address = 'localhost',
        port,
      } = await server.start();

      Logger.info('[BOOT]\t Server Ready');
      Logger.info(`[BOOT]\t Server Listening on http://${address}:${port}`);
      Logger.info('[BOOT]\t App ready');
      return app;
    } catch (error) {
      if (err.code === 'EADDRINUSE') {
        Logger.error('[BOOT]\t Address already in use');
      }
      Logger.error(err);
      process.abort();
    }
  }

};


// -------------------------------------------------------------------
// Exports

module.exports = Boot;
