/**
 * Unit Test  for the ChartMogulFeed.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
// const Util = require('../components/util');
const ChartMogulFeed = require('./chartmogul-feed');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties

const superagentMock = mockRequest(request, mockReqConf);

const feed = new ChartMogulFeed();
chai.use(chaiAsPromised);
const expect = chai.expect;


// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/mocky',
  });

  const res = httpMocks.createResponse();
  res.locals = {};

  // let spyReqChartMogul;

  after(() => superagentMock.unset());


describe('configParams', () => {
  it('should return a object', (done) => {
    feed.configByParams(req, res, ()=>{
      expect(res.locals).to.have.property('config');

      done();
    });
  });
});


  describe('requestChartMogulFor', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'get');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a Promise', (done) => {
      const promise = feed.requestChartMogulFor();
      expect(promise).to.not.be.undefined.and.null;
      expect(promise).to.be.rejected;
      expect(promise.catch).to.be.a('function');
      done();
    });

    it('should return a Promise.rejected - args[dest]:undefined', (done) => {
      const promise = feed.requestChartMogulFor();
      expect(promise).to.be.rejected;
      done();
    });

    it('should return a Promise.rejected - args[args]:/mocky', (done) => {
      const promise = feed.requestChartMogulFor('/mocky');
      expect(promise).to.be.rejected.and.notify(done);
    });

    it('should return a Promise.fulfilled - /customers', () => {
      const req = feed.requestChartMogulFor('/customers');
      expect(req).to.be.fulfilled;
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
      expect(req).to.eventually.have.property('entries');

      // req.done((data) => {
      //   expect(req).to.eventually.have.property('entries');
      //   done();
      // });
    });
  });

  describe('firstMiddleware', () => {
    beforeEach(() => {
      // spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    // afterEach(() => spyFeedReqChartMogul.restore());

    it('should go into firstMiddleware', (done) => {
      feed.firstMiddleware(req, res, () => {
        done();
      });
    });
  });

  describe('MiddleWare : fetchMrr', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call requestChartMogulFor()', (done) => {
      feed.firstMiddleware(req, res, () => {
        // expect(spyFeedReqChartMogul.called).to.be.true;
        done();
      });
    });
  });
});
