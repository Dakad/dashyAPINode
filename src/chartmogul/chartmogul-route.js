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
const Config = require('config');
const request = require('superagent');

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

    setInterval(()=> this.handlePolling(), 90000);
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
      };
      return next();
    });

    this.router_.get('/leads', async (ctx, next) => {
      const data = await this.feed_.fetchNbLeads(ctx.state.config);
      console.log(data);
      const widgetId = '144091-a92890e0-f5e8-0134-4b24-22000b498417';
      request.post('https://push.geckoboard.com/v1/send/'+widgetId)
        .send({
          'api_key': Config.geckoBoard.apiKey,
          'data': {
             'item': data,
          },
        });
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

  /**
   * @override
   */
  async handlePolling() {
      const data = await this.feed_.fetchNbLeads();
      console.log(data);
      const widgetId = '144091-6b060040-f61f-0134-9c3b-22000b4a867a ';
      request.post('https://push.geckoboard.com/v1/send/'+widgetId)
        .type('json')
        .send({
          'api_key': Config.geckoBoard.apiKey,
          'data': {
             'item': data,
          },
        })
        .end((err)=>console.error(err));
  }

};


module.exports = ChartMogulRouter;
