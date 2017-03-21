/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module {Router} router/chartmogul
 * @requires baserouter
 * @requires chartmogul-feed
 */


// -------------------------------------------------------------------
// Dependencies

// Packages

// Built-in

// Mine
// const Util = require('../components/util');
const BaseRouter = require('../base/baserouter');

// -------------------------------------------------------------------
// Properties

/**
 *
 *
 * @class ChartMogulRouter
 * @extends {BaseRouter}
 */
class ChartMogulRouter extends BaseRouter {

  /**
   * Creates an instance of ChartMogulRouter.
   * @param {ChartMogulFeed} feed
   *
   * @memberOf ChartMogulRouter
   */
  constructor(feed) {
    super('/chartmogul', feed);
  }


  /**
   *
   * @override
   *
   * @memberOf ChartMogulRouter
   */
  handler() {
    this.router_.get('/leads', this.feed_.fetchNbLeads.bind(this.feed_));

    // this.router_.all('/mrr', this.feed_.fetchMrr);

    // this.router_.all('/customers', this.feed_.fetchNbCustomers);

    // this.router_.all('/mrr/churn', this.feed_.fetchNetMRRChurnRate);

    // this.router_.all('/mrr/net', this.feed_.findMaxNetMRR);

    // this.router_.all('/mrr/move', this.feed_.fetchNetMRRMovements);

    // this.router_.all('/arr', this.feed_.fetchArr);

    // this.router_.all('/arpa', this.feed_.fetchArpa);
  }

};


module.exports = ChartMogulRouter;
