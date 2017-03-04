'use strict';

/**
 * Logger to log messages for the application.
 *
 * This is a simple wrapper for the "winston" logger.
 * Contains the same method accessible on Winston.loggerInstance
 * @module  components/logger
 * @requires config
 * @requires winston
 *
 */

// -------------------------------------------------------------------
// Modules dependencies

// npm
const Config = require('config');
const Winston = require('winston');

// Mine


Winston.emitErrs = true;


/**
 * Initialized Winston logger.
 * @private
 */
const logger = new Winston.Logger({
    transports: [
        new Winston.transports.File({
            level: 'info',
            filename: Config.api.dirLogs +'all-logs.log',
            // handleExceptions: true,
            humanReadableUnhandledException: true,
            json: true,
            maxsize: 1024000, // 1MB
            maxFiles: 1,
        }),
        new Winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: false,
            colorize: true,
        }),
    ],
    exitOnError: false,
});

/**
 * To write on file. Only info msg.
 */
logger.fsStream = {
    write: (message) => logger.info(message),
};


// -------------------------------------------------------------------
// Modules exports

module.exports = logger;

