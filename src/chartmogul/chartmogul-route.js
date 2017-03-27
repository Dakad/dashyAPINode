/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module {Router} router/chartmogul
 * @requires baserouter
 * @requires chartmogul-feed
 */


// -------------------------------------------------------------------
// Dependencies

<<<<<<< HEAD
// Packages
=======
// npm
>>>>>>> remotes/origin/koa

// Built-in

// Mine
<<<<<<< HEAD
// const Util = require('../components/util');
=======
const Util = require('../components/util');
>>>>>>> remotes/origin/koa
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
<<<<<<< HEAD
=======
   * The firstMiddleware where the request must go first.
   * Config the request for ChartMogul depending on theparams received.
   *
   * @param {any} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   * @return {Function} the next middleware()
   *
   * @memberOf ChartMogulFeed
   */
  async configByParams(ctx, next) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    ctx.state.config = {
      'start-date': Util.convertDate(today),
      'end-date': Util.convertDate(lastMonth),
      'interval': 'month',
    };
    return next();
  }


  /**
>>>>>>> remotes/origin/koa
   *
   * @override
   *
   * @memberOf ChartMogulRouter
   */
  handler() {
<<<<<<< HEAD
    this.router_.get('/leads', this.feed_.fetchNbLeads.bind(this.feed_));

    // this.router_.all('/mrr', this.feed_.fetchMrr);

    // this.router_.all('/customers', this.feed_.fetchNbCustomers);

    // this.router_.all('/mrr/churn', this.feed_.fetchNetMRRChurnRate);

    // this.router_.all('/mrr/net', this.feed_.findMaxNetMRR);

    // this.router_.all('/mrr/move', this.feed_.fetchNetMRRMovements);

    // this.router_.all('/arr', this.feed_.fetchArr);

    // this.router_.all('/arpa', this.feed_.fetchArpa);
  }

=======
    super.handler();

    this.router_.use(this.configByParams);

    this.router_.post('/leads', async (ctx, next) => {
      ctx.state.data.item = await this.feed_.fetchNbLeads(ctx.state.config);
      return next();
    });

    this.router_.post('/mrr', async ({state}, next) => {
      state.data.item = await this.feed_.fetchMrr(state.config, next);
      return next();
    });

    this.router_.post('/customers', async ({state}, next) => {
      state.data.item = await this.feed_.fetchNbCustomers(state.config, next);
      return next();
    });

    this.router_.post('/mrr/churn', async ({state}, next) => {
      const item = await this.feed_.fetchNetMRRChurnRate(state.config, next);
      state.data.item = item;
      return next();
    });

    this.router_.post('/mrr/net', async ({state}, next) => {
      const item = await this.feed_.fetchNetMRRMovement(state.config, next);
      state.data.item = item;
      return next();
    });


    this.router_.post('/mrr/move', async ({state}, next) => {
      const item = await this.feed_.fetchMRRMovements(state.config, next);
      state.data.item = item;
      return next();
    });

    this.router_.post('/arr', async ({state}, next) => {
      state.data.item = await this.feed_.fetchArr(state.config, next);
      return next();
    });

    this.router_.post('/arpa', async ({state}, next) => {
      state.data.item = await this.feed_.fetchArpa(state.config, next);
      return next();
    });
  }


>>>>>>> remotes/origin/koa
};


module.exports = ChartMogulRouter;
