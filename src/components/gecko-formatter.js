'use strict';

/**
 * For the GeckoBoard Widget.
 *
 * @module  components/gecko-formatter
 * @requires config
 *
 */

// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');


// Built-in

// Mine
const Logger = require('./logger');


// -------------------------------------------------------------------
// Properties


/**
 * The Formatter for GeckoBoard Widget
 *
 */
class GeckoBoardFormatter {


    toLeaderboard(items, format='decimal', unit) {
        return {
            'format': format,
            'unit': unit,
            'items': items,
        };
    }


}


// -------------------------------------------------------------------
// Exports

module.exports = GeckoBoardFormatter;

