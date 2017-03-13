/**
 * @overview Feeder for the chartmogul router.
 *
 * @module {Feeder} feeds/chartmogul
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const Config = require('config');
// const sinon = require('sinon');

// Built-in

// Mine
// const Util = require('../components/util');
const ChartMogulFeed = require('./chartmogul-feed');


// -------------------------------------------------------------------
// Properties

// const UtilRequestPipe = sinon.stub(Util, 'requestPicppeDriveFor').returns({
//     username: 'foo',
//     passwrod: hash('1 234'),
// });

/**
 * Mock ChartMogulFeed
 *
 * @class MockChartMogulFeed
 * @extends {ChartMogulFeed}
 */
module.exports = class MockChartMogulFeed extends ChartMogulFeed {


};
