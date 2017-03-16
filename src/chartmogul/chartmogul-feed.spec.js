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
const Config = require('../../config/test.json');
const Util = require('../components/util');
const ChartMogulFeed = require('./chartmogul-feed');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties
const feed = new ChartMogulFeed();
chai.use(chaiAsPromised);
const expect = chai.expect;

let spyFeedReqChartMogul;
let superagentMock = mockRequest(request, mockReqConf,
  (log) => console.log('superagent call', log.url));

// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
  let req;
  let res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/mocky',
    });
    res = httpMocks.createResponse();
    res.locals = {
      data: {
        api: 'API_TOKEN_FOR_MOCK_GECKOBOARD',
      },
    };
  });


  describe('configByParams', () => {
    it('should return a object', (done) => {
      feed.configByParams(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals).to.have.property('config');
        done();
      });
    });

    it('should return an object with the default params', (done) => {
      const currentDate = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentDate.getMonth() - 1);
      feed.configByParams(req, res, (err) => {
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

  describe('calcNetMovement', () => {
    it('should return 0 : invalid args', () => {
      expect(feed.calcNetMRRMovement()).to.be.equal(0);
      expect(feed.calcNetMRRMovement(undefined)).to.be.equal(0);
      expect(feed.calcNetMRRMovement(null)).to.be.equal(0);
      expect(feed.calcNetMRRMovement({})).to.be.equal(0);
      expect(feed.calcNetMRRMovement([])).to.be.equal(0);
    });

    it('should return -26,89', () => {
      const mrrs = [98458, 1800, -2970, -109447, 9470];
      expect(feed.calcNetMRRMovement(mrrs)).to.be.equal(-26.89);
    });
    it('should return 811,64', () => {
      const mrr = Config.request.chartmogul.mrr.entries[0];
      expect(feed.calcNetMRRMovement(mrr)).to.be.equal(811.64);
    });
  });

  describe('findMaxNetMRR', () => {
    it('should return 0 : invalid args', () => {
      expect(feed.findMaxNetMRR).to.throw(TypeError);
      expect(()=>feed.findMaxNetMRR()).to.throw(TypeError);
      expect(()=>feed.findMaxNetMRR(null)).to.throw(TypeError);
      expect(feed.findMaxNetMRR([])).to.be.equal(0);
    });

    it('should return 2357,7', () => {
      const mrrEntries = Config.request.chartmogul.mrr.entries;
      expect(feed.findMaxNetMRR(mrrEntries)).to.be.equal(2357.7);
    });
  });

  describe('MiddleWare - basicFetchers', (done) => {
    const middlewares = [
      {'fetch': feed.fetchMrr, 'url': '/metrics/mrr'},
      {'fetch': feed.fetchNbCustomers, 'url': '/metrics/customer-count'},
      {'fetch': feed.fetchNetMRRChurnRate, 'url': '/metrics/mrr-churn-rate'},
      {'fetch': feed.fetchArr, 'url': '/metrics/arr'},
      {'fetch': feed.fetchArpa, 'url': '/metrics/arpa'},
    ];

    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    middlewares.forEach((middleware) => {
      it(`feed.${middleware.fetch.name}() should call requestChartMogulFor()`,
        (done) => {
          middleware.fetch.call(feed, req, res, (err) => {
            if (err) return done(err);
            expect(spyFeedReqChartMogul.called).to.be.true;
            expect(spyFeedReqChartMogul.calledWith(middleware.url)).to.be.true;
            done();
          });
        });

      it(`feed.${middleware.fetch.name}() should fill data with items`, () => {
        middleware.fetch.call(feed, req, res, (err) => {
          if (err) return done(err);
          expect(res.locals.data).to.have.any.keys('item');
          expect(res.locals.data.item).to.be.a('array').and.to.not.be.empty;
          expect(res.locals.data.item).to.have.lengthOf(2);
        });
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('MiddleWare : fetchMRRMovements', (done) => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call requestChartMogulFor()', (done) => {
      feed.fetchMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
        done();
      });
    });

    it('should fill data with items', (done) => {
      feed.fetchMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.data).to.contains.all.keys('format', 'unit', 'items');
        expect(res.locals.data.format).to.be.a('string').and.eql('currency');
        expect(res.locals.data.items).to.be.a('array').and.to.not.be.empty;
        // expect(res.locals.data.items).to.have.lengthOf(4);
        done();
      });
    });

    // TODO Unit test for the parametred req
  });

  describe.skip('MiddleWare : fetchNetMRRMovements', (done) => {
    let spyCalcNetMRRMovement;
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
      spyCalcNetMRRMovement = sinon.spy(feed, 'calcNetMRRMovement');
    });

    afterEach(() => {
      spyFeedReqChartMogul.restore();
      spyCalcNetMRRMovement.restore();
    });

    it('should call requestChartMogulFor()', (done) => {
      feed.fetchMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
        done();
      });
    });

    it('should call calcNetMRRMovement()', (done) => {
      const mrrs = Config.request.chartmogul.mrr.entries[1];
      feed.fetchMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(spyCalcNetMRRMovement.called).to.be.true;
        expect(spyCalcNetMRRMovement.calledWith(mrrs)).to.be.true;
        done();
      });
    });

    it('should fill data with items', (done) => {
      feed.fetchNetMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.data).to.contains.all.keys('item');
        expect(res.locals.data.item).to.be.a('array').and.to.not.be.empty;
        done();
      });
    });

    // TODO Unit test for the parametred req
  });


  after(() => superagentMock.unset());
});
