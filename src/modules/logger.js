'use strict';

/**
 * =============================
 *
 * Logger to log messages for the application.
 * This is a simple wrapper for the "winston" logger.
 *
 */

// -------------------------------------------------------------------
// Modules dependencies

// npm
const Config = require('config');
const Winston = require('winston');
Winston.emitErrs = true;

// Mine


/**
 * Initialized Winston logger.
 */
const logger = new Winston.Logger({
    transports: [
        new Winston.transports.File({
            level: 'info',
            filename: Config.api.dirLogs +'all-logs.log',
            handleExceptions: true,
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
logger.stream = {
    write: (message) => logger.info(message),
};


// -------------------------------------------------------------------
// Modules exports

module.exports = logger;
