/**
 * @overview SubRouter to handle the all path related to /ga
 *
 * @module {Router} router/google-analytics
 * @requires baserouter
 * @requires GoogleAnalyticsFeed
 */


// -------------------------------------------------------------------
// Dependencies

// npm
// const Config = require('config');

// Built-in

// Mine
const Util = require('../components/util');
// const Pusher = require('../components/pusher');
const BaseRouter = require('../base/baserouter');


// -------------------------------------------------------------------
// Properties

/**
 *
 *
 * @class GoogleAnalyticsRouter
 * @extends {BaseRouter}
 */
class GoogleAnalyticsRouter extends BaseRouter {

  /**
   * Creates an instance of GoogleAnalyticsRouter.
   * @param {GoogleAnalyticsFeed} feed
   *
   * @memberOf GoogleAnalyticsRouter
   */
  constructor(feed) {
    super(feed, '/ga', 75);
  }


  /**
   * The firstMiddleware where the request must go first.
   * Config the request for /ga depending on the params received.
   *
   * @param {any} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   * @return {Function} the next middleware()
   *
   * @memberOf GoogleAnalyticsFeed
   */
  async configByParams(ctx, next) {
    const dates = Util.getAllDates();
    ctx.state.config = Object.assign(ctx.state.config, {
      'last-start-date': Util.convertDate(dates.firstInPastMonth),
      'last-end-date': Util.convertDate(dates.dateInPastMonth),
      'start-date': Util.convertDate(dates.firstInMonth),
      'end-date': Util.convertDate(dates.today),
    });
    return next();
  }


  /**
   *
   * @override
   *
   * @memberOf GoogleAnalyticsRouter
   */
  handler() {
    super.handler();

    this.router_.use(this.configByParams);


    this.router_.get('/visitors/(unik|uniq|unique)', async ({state}, next) => {
      state.data = await this.feed_.fetchNbUniqueVisitors(state.config);
      return next();
    });


    this.router_.get('/sessions/duration/avg', async ({state}, next) => {
      state.data = await this.feed_.fetchSessionDuration(state.config);
      return next();
    });

    this.router_.get('/bounce_rate', async ({state}, next) => {
      state.data = await this.feed_.fetchBounceRate(state.config);
      return next();
    });

    this.router_.get('/acq/src', async ({state}, next) => {
      state.data = await this.feed_.fetchBestAcquisitionSrc(state.config);
      return next();
    });

    this.router_.get('/blog/views', async ({state}, next) => {
      state.data = await this.feed_.fetchBlogPageViews(state.config);
      return next();
    });

    this.router_.get('/blog/duration', async ({state}, next) => {
      state.data = await this.feed_.fetchBlogPageDuration(state.config);
      return next();
    });

    this.router_.get('/blog/most', async ({state}, next) => {
      state.data = await this.feed_.fetchMostBlogPost(state.config);
      return next();
    });
  }

  /**
   * @override
   */
  handlerPusher() {};

};


// -------------------------------------------------------------------
// Exports


module.exports = GoogleAnalyticsRouter;
