/**
 * TDD for the ChartMogulRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
// const httpMocks = require('node-mocks-http');

// Built-in

// Mine
const MockChartMogulFeed = require('./chartmogul-feed-mock');
const ChartMogulRouter = require('./chartmogul-route');


describe('ChartMogul : Router', () => {
  let feed = new MockChartMogulFeed();
  let router;

  beforeEach(() => router = new ChartMogulRouter(feed));

  it('should have the url path set to /chartmogul', () => {
    expect(router.getURL()).to.not.be.null;
  });
});
