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
const Util = require('../components/util');
const ChartMogulFeed = require('./chartmogul-feed');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties
const feed = new ChartMogulFeed();
chai.use(chaiAsPromised);
const expect = chai.expect;

let superagentMock = mockRequest(request, mockReqConf,
  (log) => console.log('superagent call', log.url));

// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/mocky',
  });

  const res = httpMocks.createResponse();
  res.locals = {
    data: {
      api: 'API_TOKEN_FOR_MOCK_GECKOBOARD',
    },
  };

  describe('configByParams', () => {
    it('should return a object', (done) => {
      feed.configByParams(req, res, () => {
        expect(res.locals).to.have.property('config');
        done();
      });
    });

    it('should return an object with the default params', (done) => {
      const currentDate = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentDate.getMonth() - 1);
      feed.configByParams(req, res, () => {
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

    it('should return a Promise.fulfilled - /customers', (done) => {
      const promise = feed.requestChartMogulFor('/customers');
      expect(promise).to.be.fulfilled;
      expect(promise.then).to.be.a('function');
      expect(promise.catch).to.be.a('function');
      expect(promise).to.eventually.have.property('entries').and.notify(done);
    });
  });

  describe('MiddleWare : fetchMrr', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call requestChartMogulFor()', (done) => {
      feed.fetchMrr(req, res, () => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(res.locals.data).to.have.any.keys('item');
        // expect(res.locals.data.item).to.be.a('array').and.to.not.be.empty;
        done();
      });
    });
  });


  after(() => superagentMock.unset());
});
