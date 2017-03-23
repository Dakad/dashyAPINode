/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module {Router} router/chartmogul
 * @requires baserouter
 * @requires chartmogul-feed
 */


// -------------------------------------------------------------------
// Dependencies

// npm

// Built-in

// Mine
const Util = require('../components/util');
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
   *
   * @override
   *
   * @memberOf ChartMogulRouter
   */
  handler() {
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


};


module.exports = ChartMogulRouter;
