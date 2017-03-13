/**
 * Unit Test  for the ChartMogulFeed.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
// const sinon = require('sinon');
// const request = require('superagent');
// const mockRequest = require('superagent-mock');

// Built-in

// Mine
// const Util = require('../components/util');
// const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties

const ChartMogulFeed = require('./chartmogul-feed');
const feed = new ChartMogulFeed();


// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/mocky',
  });

  const res = httpMocks.createResponse();
  res.locals = {};

  // let spyUtilReqPipeDrive;

  describe('', () => {
    // let superagentMock;
    beforeEach(() => {
      // superagentMock = mockRequest(request, mockReqConf);
      // spyUtilReqPipeDrive = sinon.spy(Util, 'requestPipeDriveFor');
    });

    // afterEach(() => spyUtilReqPipeDrive.restore());


    it('should go into firstMiddleware', (done) => {
      feed.firstMiddleware(req, res, () => {
        done();
      });
    });
  });
});
