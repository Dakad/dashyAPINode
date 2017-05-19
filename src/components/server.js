'use strict';

/**
 * @fileoverview  Modules for the server.
 * Init the server by setting all necessary middlewares
 * Start the server.
 * @module  components/server
 * @requires bluebird
 * @requires koa
 * @requires koa-handle-error
 * @requires koa
 * @requires koa-morgan
 * @requires koa-cors
 * @requires koa-json
 *
 * @requires components/logger
 * @requires components/util
 *
 * @export  components/server
 */

// -------------------------------------------------------------------
// Dependencies

// npm

const Promise = require('bluebird');
const Koa = require('koa');
const kMount = require('koa-mount');
const kHandleError = require('koa-handle-error');
const kMorgan = require('koa-morgan');
const kCORS = require('kcors');
const kJSON = require('koa-json');
const kStaticServe = require('koa-static');

// Built-in
const path = require('path');


// Mine
const Logger = require('./logger');
const Util = require('./util');

/** */
class Server {

  /**
   * Creates an instance of Server.
   * @param {number} port - Where the server must listen for connection.
   */
  constructor(port=0) {
    this.numPort_ = port;
    this.app_ = new Koa();

    this.getPort = () => this.numPort_;
    this.getApp = () => this.app_;
  }


  /**
   * Init the server by setting/using all his middlewares :
   *  - Morgan to log the request
   *  - CORS to only GET, POST.
   *  - Static serve to /assets
   *
   *  - Finally, actives the routers for the server.
   * @param {Array<Router>} routers - All routes handled by the server.
   * @return {Promise} a pending promise containing the app instance.
   */
  init(routers = []) {
    return new Promise((resolve, reject) => {
      // Log any req
      Logger.info('[SERVER]\t Use Middleware : Morgan(short)');
      this.app_.use(kMorgan('short'));
      // Log error on request in files.
      Logger.info('[SERVER]\t Use Middleware : Morgan(combined) req:400>file');
      this.app_.use(kMorgan('combined', {
        skip: (ctxt, next) => ctxt.statusCode < 400,
        stream: Logger.fsStream,
      }));

      Logger.info('[SERVER]\t Use Middleware : CORS(GET,POST)');
      this.app_.use(kCORS({
        allowMethods: ['GET', 'POST'],
      }));

      Logger.info('[SERVER]\t Use Middleware : Static Serve(/assets/*)');
      // Serve static files
      const staticFolder = path.join(__dirname, '..', '..', 'assets');
      this.app_.use(kMount('/assets', kStaticServe(staticFolder)));

      Logger.info('[SERVER]\t Use Middleware : JSON(all responses)');
      // JSON all in the ctx.body
      this.app_.use(kJSON());


      // Default handler for error
      // if not set in the router.
      Logger.info('[SERVER]\t Use Middleware : HandleError(all responses)');
      this.app_.use(kHandleError(Logger.error));

      if (!Util.isEmptyOrNull(routers))
        this.initRouters(routers);
      resolve();
    });
  }


  /**
   * Init the routers for this server.
   *
   * @param {Array<Router>} routers - All routes handled by the server.
   * @inner
   */
  initRouters(routers) {
    if (Array.isArray(routers)) {
      routers.forEach((rt) => this.initRouters(rt));
    } else {
      this.app_.use(routers);
    }
  }

  /**
   * Start the server by receiving in args the init.
   *  server returned by [init method]{@link components/server#init}
   *  - Listen to the specified port.
   *  - Attach all necessary listeners.
   *
   * @param {any} app The Init server returned by
   *  [init method]{@link components/server#init}
   * @return {Promise}
   *  - a pending containing the server address.
   *  - otherwise, a rejected with a friendly error message.
   */
  start() {
    return new Promise((resolve, reject) => {
      const server = this.app_.listen(this.numPort_);
      server.on('listening', (err) => resolve(server.address()));
      server.on('close', () => Logger.warn('Missing fct to close the server'));
      server.on('error', (err) => {
        if (err.syscall !== 'listen') {
          throw err; // Wasn't listen yet !
        }
        // handle specific listen errors with friendly messages
        let errMsg = undefined;
        switch (err.code) {
          case 'EACCES':
            errMsg = 'Port :' + this.numPort_ + ' need to be admin';
            break;
          case 'EADDRINUSE':
            errMsg = 'Port :' + this.numPort_ + ' is already in use.\n';
            break;
          default:
            errMsg = err.message;
        }
        reject(new Error(errMsg, err));
      });
    });
  }
};

// -------------------------------------------------------------------
// Exports
module.exports = Server;
