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
      'start-date': Util.convertDate(lastMonth),
      'end-date': Util.convertDate(today),
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

    this.router_.get('/', async (ctx, next) => {
      ctx.state.data = {
        'leads': 'GET /leads',
        'mrr': 'GET /mrr',
        'Nb Clients': 'GET /customers',
        'Net MRR Churn': 'GET /mrr/churn',
      };
      return next();
    });

    this.router_.get('/leads', async (ctx, next) => {
      ctx.state.data.item = await this.feed_.fetchNbLeads(ctx.state.config);
      console.log(ctx.state.data.item);
      return next();
    });

    this.router_.get('/mrr', async ({state}, next) => {
      state.data.item = await this.feed_.fetchMrr(state.config, next);
      return next();
    });

    this.router_.get('/customers', async ({state}, next) => {
      state.data.item = await this.feed_.fetchNbCustomers(state.config, next);
      return next();
    });

    this.router_.get('/mrr/churn', async ({state}, next) => {
      const item = await this.feed_.fetchNetMRRChurnRate(state.config, next);
      state.data.item = item;
      state.data.type = 'reverse';
      return next();
    });

    this.router_.get('/mrr/net', async ({state}, next) => {
      const item = await this.feed_.fetchNetMRRMovement(state.config, next);
      state.data.item = item;
      return next();
    });


    this.router_.get('/mrr/move', async ({state}, next) => {
      state.data = await this.feed_.fetchMRRMovements(state.config, next);
      return next();
    });

    this.router_.get('/arr', async ({state}, next) => {
      state.data.item = await this.feed_.fetchArr(state.config, next);
      return next();
    });

    this.router_.get('/arpa', async ({state}, next) => {
      state.data.item = await this.feed_.fetchArpa(state.config, next);
      return next();
    });
  }


};


module.exports = ChartMogulRouter;
