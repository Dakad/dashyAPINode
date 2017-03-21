/* eslint-disable new-cap */

/**
 * TDD for the ChartMogulRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
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
