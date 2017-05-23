'use strict';

/**
 * @overview Logger to log messages for the application.
 * This is a simple wrapper for the "winston" logger.
 * Contains the same method accessible on Winston.loggerInstance
 *
 * @module  components/logger
 * @requires config
 * @requires winston
 *
 * @export  components/logger
 */

// -------------------------------------------------------------------
// Modules dependencies

// npm
const {api: configAPI} = require('config');
const Winston = require('winston');

// Buil-in
const fs = require('fs');

// Mine


// -------------------------------------------------------------------
// Properties

const dirConfig = configAPI.dirLogs;


Winston.emitErrs = true;

console.info('[LOGGER] ****** Checking for the Logs folder ....');
if(!fs.existsSync(dirConfig)) {
    try{
        fs.mkdirSync(dirConfig);
    }catch (err) {
        if (err.code !== 'EEXIST') {
            if (err.code === 'EPERM' || err.code === 'EACCES') {
                console.error('!!!!! Cannot create folder. Must be admin to.');
            } else {
                console.error(err.message);
            }
            process.exit(err.errno);
        }
    }
}

console.info('[LOGGER] *** Logs folder created');


/** @const {Winston.Logger} logger_ - Initialized Winston logger*/
const logger = new Winston.Logger({
    transports: [
        new Winston.transports.File({
            level: 'info',
            filename: dirConfig +'/all-logs.log',
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

