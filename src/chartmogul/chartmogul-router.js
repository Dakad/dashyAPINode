/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module router/chartmogul
 * @requires config
 * @requires components/util
 * @requires components/pusher
 * @requires router/base
 * @requires feeder/chartmogul
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
 * SubRouter to handle the all path related to /chartmogul
 *
 * @extends router/baase
 */
class ChartMogulRouter extends BaseRouter {

  /**
   * Creates an instance of ChartMogulRouter.
   * @param {module:feeder/chartmogul} feed - The feeder for this router.
   */
  constructor(feed) {
    super(feed, '/chartmogul', 90);
  }


  /**
   * The firstMiddleware where the request must go first.
   * Config the request for ChartMogul depending on theparams received.
   *
   * @param {Application.Context} ctx The context of the request and response.
   * @param {Function} next The next middleware to call.
   * @return {Function} the next middleware()
   *
   */
  async configByParams(ctx, next) {
    // Check query
    const dates = Util.getAllDates();
    ctx.state.config = Object.assign(ctx.state.config, {
      'last-start-date': Util.convertDate(dates.firstInPastMonth),
      'last-end-date': Util.convertDate(dates.dateInPastMonth),
      'start-date': Util.convertDate(dates.endInPastMonth),
      'end-date': Util.convertDate(dates.today),
      'interval': 'month',
    });
    return next();
  }


  /** @override */
  handler() {
    super.handler();

    this.router_.use(this.configByParams);

    /**
      *
      * @api {GET} /chartmogul Get the list of routes
      * @apiName GetAllRoutesForChartMogul
      * @apiGroup ChartMogul
      * @apiVersion  0.1.0
      *
      *
      * @apiSuccess (200) {Object} routes All routes callables for /chartmogul
      *
      * @apiSuccessExample  {JSON} routes
        {
            title : 'METHOD /url'
        }
      *
      *
      */

    /**
     *
     * @api {GET} /chartmogul/leads Get the leads for the month
     * @apiName GetLeadsMonth
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} leads description
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item": [{
             "value" : {number} Current value for this month.
           },
           {
             "value" : {number} Value for the same periode on previous month.
           }]
       }
     *
     *
     */
    this.router_.get('/leads', async(ctx, next) => {
      ctx.state.data = await this.feed_.fetchNbLeads(ctx.state.config);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/mrr Get the MRR
     * @apiName GetMRR
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} mrr description
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item":[{
              "value" : {number} Current value for this month.
              "prefix" : "€"
           },
           {
            "value" : {number} Value for the previous month.
           }]
       }
     *
     *
     */
    this.router_.get('/mrr', async({
      state}, next) => {
      state.data = await this.feed_.fetchMrr(state.config, next);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/customers Get the customers count for the month
     * @apiName GetMonthCustomers
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} customers description
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
          "item": {
            "value" : {number} Current value for this month.
          },
          {
            "value" : {number} Value for the previous month.
          }
       }
     *
     *
     */
    this.router_.get('/customers', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchNbCustomers(state.config, next);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/mrr/churn Get Net MRR Churn
     * @apiName GetMRRNetChurn
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} churn Resuts
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
          "item":[{
            "value" : {number} Current value for this month,
            "prefix" : "%"
          },
          {
            "value" : {number} Value for the previous month.
          }],
          "type" : "reverse"
       }
     *
     *
     */
    this.router_.get('/mrr/churn', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchNetMRRChurnRate(state.config, next);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/mrr/net Get Net MRR
     * @apiName GetMRRNet
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) html HTML Output
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "item":[
             {
               "text": HTMLtext with the current value
                      and the best move ever made.
             }
           ],
       }
     *
     *
     */
    this.router_.get('/mrr/net', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchNetMRRMovement(state.config, next);
      return next();
    });


    /**
     *
     * @api {GET} /chartmogul/mrr/moves Get the MRR Movements
     * @apiName GetMRRMoves
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} mrrMoves The 5 moves
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
           "format": "currency",
           "items": [
               {
                   "label": "New Business",
                   "value": {Number} Current value for the month
               },
               {
                   "label": "Expansion",
                   "value": {Number} Current value for the month
               },
               {
                   "label": "Contraction",
                   "value": {Number} Current value for the month
               },
               {
                   "label": "Churn",
                   "value": {Number} Current value for the month
               },
               {
                   "label": "Reactivation",
                   "value": {Number} Current value for the month
               }
           ],
           "unit": "EUR"
       }
     *
     *
     */
    this.router_.get('/mrr/move', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchMRRMovements(state.config, next);
      return next();
    });

    /**
      *
      * @api {GET} /chartmogul/arr Get the ARR
      * @apiName GetARR
      * @apiGroup ChartMogul
      * @apiVersion  0.1.0
      *
      *
      * @apiSuccess (200) {Object} arr The Annualized Run Rate
      *
      * @apiSuccessExample  {JSON} Success-Response:
        {
            "item":[
              {
                "value": {number} arr The current value for the month.
                "prefix" : "€"
              },
              {
                "value": {number} arr The value of the previous month.
              }
            ],
        }
      *
      *
      */
    this.router_.get('/arr', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchArr(state.config, next);
      return next();
    });

    /**
      *
      * @api {GET} /chartmogul/arpa Get the ARPA
      * @apiName GetARPA
      * @apiGroup ChartMogul
      * @apiVersion  0.1.0
      *
      *
      * @apiSuccess (200) {Object} arpa The Average Revenue Per Account
      *
      * @apiSuccessExample  {JSON} Success-Response:
      {
          "item":[
            {
              "value": {number} arr The current value for the month.
              "prefix" : "€"
            },
            {
              "value": {number} arr The value of the previous month.
            }
          ],
      }
      *
      *
      */
    this.router_.get('/arpa', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchArpa(state.config, next);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/leads/today Get the leads for today
     * @apiName GetLeadsToday
     * @apiGroup ChartMogul
     * @apiVersion  0.1.0
     *
     *
     * @apiSuccess (200) {Object} leads description
     *
     * @apiSuccessExample  {JSON} Success-Response:
       {
         item :[{
           "value" : {number} Current value for today since 00:00:00.
          },
          {
            "value" : {number} The AVG on the last 30 days without today leads.
          }
       }
     *
     *
     */
    this.router_.get('/leads/today', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchNbLeadsToday(state.config);
      return next();
    });

    // LeaderBoard of 5 Most Plans Subscribed
    /**
     *
     * @api {GET} /chartmogul/plans/top Get the top plans
     * @apiName GetTopPlansByCustomers
     * @apiGroup ChartMogul
     * @apiVersion  0.4.0
     *
     *
     *
     * @apiSuccess (200) {Array} plans The top plans sorted by the customers
     *  count.
     *
     * @apiParam  {string} [filter] To only keep or add ! before the filter
     * value to exclude.
     *
     * @apiSuccessExample {JSON} Success-Response:
      {
        "format" : "decimal",
        "items": [
          {
            "label": {String} Plan' name,
            "value": {number} Plan subscribers
          }
        ]
      }
     *
     *
     */
    this.router_.get('/plans/top', async({
      state,
    }, next) => {
      const firstInMonth = new Date();

      if (firstInMonth.getDate() === 1) {
        firstInMonth.setDate(0); // Start from the end last month
      }
      firstInMonth.setDate(1);
      state.config['start-date'] = Util.convertDate(firstInMonth);

      state.data = await this.feed_.fetchMostPlansPurchased(state.config);
      return next();
    });

    // Pages HTML for the 5 last Customers
    /**
     *
     * @api {GET} /chartmogul/customers/latest Get the latest customers
     * @apiName GetLatestCustomers
     * @apiGroup ChartMogul
     * @apiVersion  0.2.0
     *
     *
     *
     * @apiSuccess (200) {Object} latestCustomers The latest customers sorted
     *  by their subscription date. limited to 5 customers
     *
     * @apiParam  {string=html,json} [out="html"] The output format.
     *
     * @apiSuccessExample {JSON} Formatted-JSON:Success-Response:
       [{
         country : {string} ISO-3611-2 Country
         country_full: {string} Full name of the country,
         name : {string} The customer name,
         company : {string} The customer company
         date : {string} The customer subscription datetime
         mrr : {number} The incommint MRR for this customer

       }]
     *
     * @apiSuccessExample {JSON} Formatted-HTML:Success-Response:
        {
            "text": "<div>
                        <img src="/assets/img/flags/${ISO3611Code}.png"
                            alt="Flag of ${country}"
                            style="fl:left;m: 0 5px;w:150px;h:150px;">
                        <h1 style="m:0 10px 15px 0;">
                          <u>${customer.company|customer.name}</u>
                        </h1>
                        <h2 style="m-bottom:5px;">
                          <img src="/assets/img/icons/datetime.png"
                              alt="DateTime"
                              style="fl:left;w:25px;h:25px;m:0 5px;"/>
                              ${customer.subscription_date}
                        </h2>
                        <h2 style="m-bottom:5px;">
                          <img src="/assets/img/icons/world.png"
                              alt="City"
                              style="fl:left;w:30px;h:30px;m:0 5px;"/>
                              ${customer.city||customer.country.toUpperCase()}
                        </h2>
                        <h2 style="m-bottom:5px;">
                          <img src="assets/img/icons/euro.png"
                              alt="MRR"
                              style="fl:left;w:25px;h:25px;m:0 5px;"/>
                              ${customer.mrr}/Month
                        </h2>
                      </div>",
            type": {number=0,1} Usually 0, if set to 1, it's fresh
        }
     *
     */
    this.router_.get('/customers/(last|latest)', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchLatestCustomers(state.config);
      return next();
    });

    // Pages HTML for the 5 last Leads
    /**
     *
     * @api {GET} /chartmogul/leads/latest Get the latest leads
     * @apiName GetLatestleads
     * @apiGroup ChartMogul
     * @apiVersion  0.2.0
     *
     *
     *
     * @apiSuccess (200) {Object} latestleads The latest leads sorted
     *  by their free_tial_started date limited to 5 leads
     *
     * @apiParam  {string=html,json} [format="html"] The output format.
     *
     * @apiSuccessExample {JSON} Formatted-JSON:Success-Response:
       [{
         country : {string} ISO-3611-2 Country
         country_full: {string} Full name of the country,
         name : {string} The lead name,
         company : {string} The lead company
         date : {string} The starting lead datetime
       }]
     *
     * @apiSuccessExample {JSON} Formatted-HTML:Success-Response:
        {
            "text": "<div>
                        <img src="/assets/img/flags/${ISO3611Code}.png"
                            alt="Flag of ${country}"
                            style="fl:left;m: 0 5px;w:150px;h:150px;">
                        <h1 style="m:0 10px 15px 0;">
                          <u>${lead.company|lead.name}</u>
                        </h1>
                        <h2 style="m-bottom:5px;">
                          <img src="/assets/img/icons/datetime.png"
                              alt="DateTime"
                              style="fl:left;w:25px;h:25px;m:0 5px;"/>
                              ${lead.subscription_date}
                        </h2>
                        <h2 style="m-bottom:5px;">
                          <img src="/assets/img/icons/world.png"
                              alt="City"
                              style="fl:left;w:30px;h:30px;m:0 5px;"/>
                              ${lead.city||lead.country.toUpperCase()}
                        </h2>
                      </div>",
            type": {number=0,1} Usually 0, if set to 1, it's fresh
        }
     *
     */
    this.router_.get('/leads/(last|latest)', async({
      state,
    }, next) => {
      state.config.onlyLead = true;
      state.data = await this.feed_.fetchLatestCustomers(state.config);
      return next();
    });

    /**
     *
     * @api {GET} /chartmogul/customers/country
     * Get Customer count grouped by their Country
     * @apiName GetCustomersCountry
     * @apiGroup ChartMogul
     * @apiVersion  0.4.0
     *
     * @apiParam  {string=html,json} [out="html"] The output format.
     *
     * @apiSuccess (200) {Object} list The list of country with the higher
     *  new customer
     *
     *
     * @apiSuccessExample {JSON} Formatted-JSON:Success-Response:
       [{
         ISO-3611-2 Country : Customer count
       }]
     *
     * @apiSuccessExample {JSON} Formatted-HTML:Success-Response:
        {
          "item" : [
            {
              "text" : "<table>
                <tbody>
                  <tr>
                    <td>
                      <img src="assets/flags/${icon_flag}.png"
                        alt="Flag of ${country}">
                    </td>
                    <td>${country name}</td>
                    <td >${customer count}</td>
                  </tr>
                </tbody>
              </table>"
            }
          ]
        }

       ]
     *
     */
    this.router_.get('/customers/country', async({
      state,
    }, next) => {
      state.data = await this.feed_.fetchCountriesByCustomers(state.config);
      return next();
    });
  }

  /** @override */
  handlerPusher() {
    const widgets = Config.geckoBoard.widgets;

    [
      [
        widgets.leadsMonth.id, // Leads Month
        this.feed_.fetchNbLeads,
        widgets.leadsMonth.pushTime,
      ],
      [
        widgets.leadsToday.id, // Leads Today
        this.feed_.fetchNbLeadsToday,
        widgets.leadsToday.pushTime,
      ],
      [
        widgets.latestCustomers.id, // Last Customers Month
        [this.feed_.fetchLatestCustomers, {onlyLead: false}],
        widgets.latestCustomers.pushTime,
      ],
      [
        widgets.latestLeads.id, // Last Leads Month
        [this.feed_.fetchLatestCustomers, {onlyLead: true}],
        widgets.latestLeads.pushTime,
      ],
    ].forEach((p) => this.listPushers_.push(new Pusher(...p, this.feed_)));
  };

};


// -------------------------------------------------------------------
// Exports


module.exports = ChartMogulRouter;
