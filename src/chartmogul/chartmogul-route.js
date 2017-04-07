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
const Pusher = require('../components/pusher');
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
    super(feed, '/chartmogul', 50);
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
    lastMonth.setDate(0);
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
        'Top 5 plans/customers': 'GET /plans/top',
      };
      return next();
    });

    this.router_.get('/leads', async (ctx, next) => {
      ctx.state.data = await this.feed_.fetchNbLeads(ctx.state.config);
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

    this.router_.get('/leads/today', async ({state}, next) => {
      state.data = await this.feed_.fetchNbLeadsToday(state.config);
      return next();
    });

    // LeaderBoard of 5 Most Plans Subscribed
    this.router_.get('/plans/top', async ({state}, next) => {
      const top = await this.feed_.fetchMostPlansPurchased(state.config);
      state.data.items = top;
      return next();
    });

    // Pages HTML for the 5 last Customers
    this.router_.get('/customers/latest', async ({state}, next) => {
      state.data = await this.feed_.fetchLatestCustomers(state.config);
      return next();
    });

    // Pages HTML for the 5 last Leads
    this.router_.get('/leads/latest', async ({state}, next) => {
      state.config.onlyLead = true;
      state.data = await this.feed_.fetchLatestCustomers(state.config);
      return next();
    });

    this.router_.get('/mrr/map', async (ctx, next) => {
      ctx.throw('Not Yet implemented');
      // return next();
    });
  }

  /**
   * @override
   */
  handlerPusher() {
    // TODO Export the Widgets' ID into the conf file
    [
      ['144091-6b060040-f61f-0134-9c3b-22000b4a867a', // Leads Month
        async () => ({'item': await this.feed_.fetchNbLeads()}),
      ],
      ['144091-122cb660-f785-0134-c10c-22000b248df5', // Leads Month
        async () => ({
          'absolute': true,
          'item': await this.feed_.fetchNbLeadsToday(),
        }),
      ],
      ['144091-4946dac0-fdc8-0134-566c-22000b498417', // Customers Month
        async () => ({'item': await this.feed_.fetchLatestCustomers({
          onlyLead: false,
        })}),
      ],
      ['144091-117deab0-fdbe-0134-6def-22000abade87', // Leads Month
        async () => ({'item': await this.feed_.fetchLatestCustomers({
          onlyLead: true,
        })}),
      ],
    ].forEach((p) => this.listPushers_.push(new Pusher(p[0], p[1], p[2])));
  };

};


// -------------------------------------------------------------------
// Exports


module.exports = ChartMogulRouter;
