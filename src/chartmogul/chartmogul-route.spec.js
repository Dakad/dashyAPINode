/**
 * TDD for the ChartMogulRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
const sinon = require('sinon');
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
let req;
let res;
let next;
let spyNext;


// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Router', () => {
  // before(() => router = new ChartMogulRouter(feed));


  beforeEach((done) => {
    router = new ChartMogulRouter(feed);
    server.initRouters(router.init());
    server.init().then(() => {
      openedServer = server.getApp().listen();
    }).done(done);
  });


  afterEach(() => openedServer.close());


  it('should have the url path set to /chartmogul', () => {
    expect(router.getURL()).to.not.be.null;
  });


  it('should go into BaseRouter.checkMiddleware', () => {
    // TODO Check if got the expected response with SuperAgentMock
  });

  it('should call the fetchMrr', () => {

  });
});
