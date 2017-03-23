/* eslint-disable new-cap */

/**
 * TDD for the ChartMogulRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const {expect} = require('chai');
// const sinon = require('sinon');
const Supertest = require('supertest');
// const httpMocks = require('node-mocks-http');

// Built-in

// Mine
const Server = require('../components/server');
const ChartMogulFeed = require('./chartmogul-feed');
const ChartMogulRouter = require('./chartmogul-route');

// -------------------------------------------------------------------
// Properties
const feed = new ChartMogulFeed();
const server = new Server(0);

let openedServer;
let router;
// let spyNext;


// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Router', () => {
  before((done) => {
    router = new ChartMogulRouter(feed);
    server.initRouters(router.init());
    server.init().then(() => {
      openedServer = server.getApp().listen();
    }).done(done);
  });


  after(() => openedServer.close());


  it('should have the url path set to /chartmogul', () => {
    expect(router.getURL()).to.not.be.null;
  });


  describe('configByParams', () => {
    it('should return a object', (done) => {
      router.configByParams(ctx, (err) => {
        if (err) return done(err);
        expect().to.have.property('config');
        done();
      });
    });

    it('should return an object with the default params', (done) => {
      const currentDate = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentDate.getMonth() - 1);
      router.configByParams(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.config)
          .to.have.any.keys('start-date', 'end-date', 'interval');
        expect(res.locals.config['start-date'])
          .to.be.eql(Util.convertDate(currentDate));
        expect(res.locals.config['end-date'])
          .to.be.equal(Util.convertDate(lastMonth));
        expect(res.locals.config['interval']).to.be.eql('month');
        done();
      });
    });
  });


  it('should go into ChartMogulRouter.handler', (done) => {
    // TODO Check if got the expected response with SuperAgentMock.
    Supertest(openedServer)
      .get('/chartmogul/leads')
      .expect(200)
      .expect(({
        body,
      }) => {
        expect(body).to.be.a('object');
        expect(body).to.have.any.keys('api');
        expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
      })
      .end(done); ;
  });

  it.skip('should call the fetchMrr', () => {
    // TODO Put a spy on it.
    // TODO  Must check if the middleware is really called
  });
});
