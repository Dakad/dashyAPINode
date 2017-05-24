/**
 * @overview SubRouter to handle the all path related to /ga
 *
 * @module router/google-analytics
 * @requires router/base
 * @requires feeder/google-analytics
 * @requires components/util
 * @requires components/pusher
 *
 * @requires config
 *
 *
 */


// -------------------------------------------------------------------
// Dependencies

// npm
const Config = require('config');

// Built-in

// Mine
const Util = require('../components/util');
const Pusher = require('../components/pusher');
const BaseRouter = require('../base/baserouter');


// -------------------------------------------------------------------
// Properties

/**
 * SubRouter to handle the all path related to /ga
 *
 * @extends module:router/base
 */
class GoogleAnalyticsRouter extends BaseRouter {

  /**
   * Creates an instance of GoogleAnalyticsRouter.
   * @param {module:feeder/google-analytics} feed - The feeder for this router.
   *
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
   */
  handler() {
    super.handler();

    /**
      *
      * @api {GET} /ga Get the list of routes
      * @apiName Get1AllRoutesForGoogleAnalytics
      * @apiGroup Google Analytics
      * @apiVersion  0.4.0
      *
      *
      * @apiSuccess (200) {Object} routes All routes callables for /ga
      *
      * @apiSuccessExample  {JSON} routes
        {
            title : 'METHOD /url'
        }
      *
      *
      */
    this.router_.use(this.configByParams);

    /**
     *
     * @api {GET} /ga/visitors/unique
     *  Get the nb of Unique Visitors on apptweak.com
     * @apiName GetUniqueVisitors
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     * @apiDescription Fetch the primary data by starting on
     * the first in this month until today.
     *
     * For the second value is the same logic applied to the previous month
     * from the first day until the same date on the past month.
     *
     * @apiSuccess (200) {Object} values
     * The values for the month vs previous one.
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "value" : {number} Current value for this month.
           },
           {
             "value" : {number} Value for the previous month.
           }]
       }
     *
     *
     */
    this.router_.get('/visitors/(unik|uniq|unique)', async ({state}, next) => {
      state.data = await this.feed_.fetchNbUniqueVisitors(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/sessions/duration/avg
     *  Get the AVG Duration spent for this month on apptweak.com
     * @apiName GetAVGSessionDuration
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     * @apiParam  {string=html} [out] The output format of Response
     *
     * @apiSuccess (200) {Object} values
     * The values for the month vs previous one.
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "type" : "time_duration"
             "value" : {number} Current value for this month.
           },
           {
             "value" : {number} Value for the previous month.
           }],
           "absolute" : true
       }
     *
     *
     * @apiSuccessExample {JSON} Formatted-HTML:Success-Response:
     {
       "item" : [
         {
          "type" : 0,
          "text" : "<div class="main-stat t-size-x52">
                      ${min}<span class="unit">m</span>
                      ${sec}<span class="unit">s</span>
                    </div>
                    <br>
                    <div class="main-stat t-size-x44
                        arrow arrow-(down|up) (negative|positive)"
                    >
                      ${diff-min}<span class="unit">m</span>
                      ${diff-sec}<span class="unit">s</span>
                    </div>
          "
         }
       ]
     }
     *
     */
    this.router_.get('/sessions/duration/avg', async ({state}, next) => {
      state.data = await this.feed_.fetchSessionDuration(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/bounce_rate
     *  Get the Bounce Rate for this month on apptweak.com
     * @apiName GetBounceRate
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     *
     * @apiSuccess (200) {Object} values
     * The values for the month vs previous one.
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "value" : {number} Current value for this month,
             "prefix" : "%"
           },
           {
             "value" : {number} Value for the previous month.
           }],
           "absolute" : true,
           "type" : "reverse"
       }
     *
     *
     */
    this.router_.get('/bounce_rate', async ({state}, next) => {
      state.data = await this.feed_.fetchBounceRate(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/acq/src
     *  Get the Best Acquisition Source for this month
     * @apiName GetAcqSrc
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     * @apiParam  {string=json} [out] The output format of Response
     *
     * @apiSuccess (200) {Object} values
     *
     * @apiSuccessExample {JSON} Success-Response:
     {
       "percentage" : "hide",
       "item" : [
         {
          "label" : Source name,
          "value" : How many New Users
         }
       ]
     }
     *
     * @apiSuccessExample  {JSON} Formatted-HTML:Success-Response:
       [
           {
             "source" : Source name,
             "newUsers" : "number"
           }
       ]
     *

     */
    this.router_.get('/acq/src', async ({state}, next) => {
      state.data = await this.feed_.fetchBestAcquisitionSrc(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/blog/views
     *  Get the nb page views for this month on apptweak.com/aso-blog
     * @apiName GetBlogPageViews
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     *
     * @apiSuccess (200) {Object} values
     * The values for the month vs previous one.
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "value" : {number} Current value for this month.
           },
           {
             "value" : {number} Value for the previous month.
           }]
       }
     *
     *
     */
    this.router_.get('/blog/views', async ({state}, next) => {
      state.data = await this.feed_.fetchBlogPageViews(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/blog/duration
     *  Get the AVG Duration spent for this month on apptweak.com/aso-blog
     * @apiName GetBlogSessionDuration
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     *
     * @apiSuccess (200) {Object} values
     * The values for the month and previous one.
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "type" : "time_duration"
             "value" : {number} Current value for this month.
           },
           {
             "value" : {number} Value for the previous month.
           }],
           "absolute" : true
       }
     *
     *
     * @apiSuccessExample {JSON} Formatted-HTML:Success-Response:
     {
       "item" : [
         {
          "type" : 0,
          "text" : "<div class="main-stat t-size-x52">
                      ${min}<span class="unit">m</span>
                      ${sec}<span class="unit">s</span>
                    </div>
                    <br>
                    <div class="main-stat t-size-x44
                        arrow arrow-(down|up) (negative|positive)"
                    >
                      ${diff-min}<span class="unit">m</span>
                      ${diff-sec}<span class="unit">s</span>
                    </div>
          "
         }
       ]
     }
     *
     */
    this.router_.get('/blog/duration', async ({state}, next) => {
      state.data = await this.feed_.fetchBlogPageDuration(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /ga/blog/most
     *  Get the Most popular post on apptweak.com/aso-blog
     * @apiName GetBlogMostPost
     * @apiGroup Google Analytics
     * @apiVersion  0.4.0
     *
     * @apiParam  {string=json} [out] The output format of Response
     *
     * @apiSuccess (200) {Object} values
     *
     * @apiSuccessExample  {JSON} FormattedJSON:Success-Response:
       [
           {
             "title" : Post title,
             "path" : The path f the post on apptweak.com/aso-blog,
             "nbViews" : Nb views made for this month,
             "oldViews" : Nb views made on the previous month
           },
           "absolute" : true
       ]
     *
     *
     * @apiSuccessExample {JSON} Success-Response:
     {
       "item" : [
         {
          "type" : 0,
          "text" : "
            <table>
              <tr>
                <td>
                  <i class='t-size-x30 arrow arrow-up  positive '>${arrow}</i>
                </td>
                <td>${post title}</td>
                <td>${post nbviews}</td>
                <td >${post oldviews}</td>
              </tr>
            </table>
          "
         }
       ]
     }
     *
     */
    this.router_.get('/blog/most', async ({state}, next) => {
      state.data = await this.feed_.fetchMostBlogPost(state.config);
      return next();
    });
  }

  /**
   * @override
   */
  handlerPusher() {
    const widgets = Config.geckoBoard.widgets;

    [
      [
        widgets.currentActiveUsers.id, // Current Active users on apptweak.com
        this.feed_.fetchRealTimeVisitors,
        widgets.currentActiveUsers.pushTime,
      ],
    ].forEach((p) => this.listPushers_.push(new Pusher(...p, this.feed_)));
  };

};


// -------------------------------------------------------------------
// Exports


module.exports = GoogleAnalyticsRouter;
