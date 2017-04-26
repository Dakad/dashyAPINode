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

    this.router_.get('/', async (ctx, next) => {
      return ctx.redirect('/assets/routes/ga.json');
    });
  }

  /**
   * @override
   */
  handlerPusher() {
    // const widgets = Config.geckoBoard.widgets;

  };

};


// -------------------------------------------------------------------
// Exports


module.exports = GoogleAnalyticsRouter;
