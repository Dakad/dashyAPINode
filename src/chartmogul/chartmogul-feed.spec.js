/**
 * Unit Test  for the ChartMogulFeed.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
<<<<<<< HEAD
const httpMocks = require('node-mocks-http');
=======
// const httpMocks = require('node-mocks-http');
>>>>>>> remotes/origin/koa
const sinon = require('sinon');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
const Config = require('../../config/test.json');
<<<<<<< HEAD
const Util = require('../components/util');
=======
>>>>>>> remotes/origin/koa
const ChartMogulFeed = require('./chartmogul-feed');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties
const feed = new ChartMogulFeed();
chai.use(chaiAsPromised);
<<<<<<< HEAD
const expect = chai.expect;
=======
const {expect} = chai;
>>>>>>> remotes/origin/koa

let spyFeedReqChartMogul;
let superagentMock = mockRequest(request, mockReqConf,
  (log) => console.log('superagent call', log.url));

// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
<<<<<<< HEAD
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
=======
  beforeEach(() => { });

>>>>>>> remotes/origin/koa

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
      expect(promise)
        .to.eventually.contains.all.keys([
          'entries',
        ])
        .and.notify(done);
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
      const mrr = Config.request.chartMogul.mrr.entries[0];
      feed.calcNetMRRMovement(Config.request.chartMogul.mrr.entries[0]);
      feed.calcNetMRRMovement(Config.request.chartMogul.mrr.entries[1]);
      feed.calcNetMRRMovement(Config.request.chartMogul.mrr.entries[2]);
      expect(feed.calcNetMRRMovement(mrr)).to.be.equal(811.64);
    });
  });

  describe('findMaxNetMRR', () => {
    it('should return 0 : invalid args', () => {
      expect(feed.findMaxNetMRR).to.throw(TypeError);
      expect(() => feed.findMaxNetMRR()).to.throw(TypeError);
      expect(() => feed.findMaxNetMRR(null)).to.throw(TypeError);
      expect(feed.findMaxNetMRR([])).to.be.equal(0);
    });

    it('should return 2357,70', () => {
      const mrrEntries = Config.request.chartMogul.mrr.entries;
      expect(feed.findMaxNetMRR(mrrEntries)).to.be.eql(2357.70);
    });
  });

  describe('filterCustomers', () => {
    it('should return [] : args[customers] invalid', () => {
      expect(feed.filterCustomers()).to.be.a('array').and.to.be.empty;
      expect(feed.filterCustomers(undefined)).to.be.a('array').and.to.be.empty;
      expect(feed.filterCustomers('1')).to.be.a('array').and.to.be.empty;
      expect(feed.filterCustomers(1234)).to.be.a('array').and.to.be.empty;
      expect(feed.filterCustomers({})).to.be.a('array').and.to.be.empty;
      expect(feed.filterCustomers(new Set())).to.be.a('array').and.to.be.empty;
    });

    it('should return Array[1]', () => {
      const customers = Config.request.chartMogul.customers[0].entries;
      const res = feed.filterCustomers(customers);
      expect(res).to.not.be.empty;
      expect(res).to.have.lengthOf(1);
    });
    it('should return Array[2] onlyLead', () => {
      const customers = Config.request.chartMogul.customers[0].entries;
      const res = feed.filterCustomers(customers, true);
      expect(res).to.not.be.empty;
      expect(res).to.have.lengthOf(2);
    });
    it('should return []', () => {
      const customers = Config.request.chartMogul.customers[2].entries;
      let res = feed.filterCustomers(customers, true);
      expect(res).to.be.a('array').and.to.be.empty;

      res = feed.filterCustomers(customers);
      expect(res).to.be.a('array').and.to.be.empty;
    });
  });


  describe('fetchAndFilterCustomers', () => {
    let spyFetchAndFilter;

    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
      spyFetchAndFilter = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => {
      spyFeedReqChartMogul.restore();
      spyFetchAndFilter.restore();
    });


    it('should call spyFeedReqChartMogul()', () => {
      const nbCalls = Config.request.chartMogul.customers[0].total_pages;
      feed.fetchAndFilterCustomers(1)
        .then((data) => {
          expect(spyFeedReqChartMogul.called).to.be.true;
          expect(spyFetchAndFilter.callCount)
            .to.be.eq(nbCalls);
          expect(spyFeedReqChartMogul.firstCall.calledWith('/customers', {
            'page': 1,
          })).to.be.true;
          expect(spyFeedReqChartMogul.secondCall.calledWith('/customers', {
            'page': 2,
          })).to.be.true;
          // expect(spyFetchAndFilter.firstCall.args[0])
          //   .to.be.equal(1);
          // expect(spyFetchAndFilter.secondCall.args[0])
          //   .to.be.equal(2);
        });
    });

    it('should return customers : [1]', () => {
      const customers = feed.fetchAndFilterCustomers(1);
      customers.done((data) => {
        expect(data).to.be.a('array').and.to.not.be.empty;
        expect(data).to.have.lengthOf(1);
      });
    });

    it('should return leads : [7]', () => {
      const leads = feed.fetchAndFilterCustomers(1, true);
      leads.done((data) => {
        expect(data).to.be.a('array').and.to.not.be.empty;
        expect(data).to.have.lengthOf(7);
      });
    });

    it('should return customers && leads : []', () => {
      let leads = feed.fetchAndFilterCustomers(3);
      leads.done((data) => {
        expect(data).to.be.a('array').and.to.be.empty;
      });

      leads = feed.fetchAndFilterCustomers(3, true);
      leads.done((data) => {
        expect(data).to.be.a('array').and.to.be.empty;
      });
    });
  });

  describe('MiddleWare - basicFetchers', (done) => {
    const middlewares = [
<<<<<<< HEAD
      {'fetch': feed.fetchMrr, 'url': '/metrics/mrr'},
      {'fetch': feed.fetchNbCustomers, 'url': '/metrics/customer-count'},
      {'fetch': feed.fetchNetMRRChurnRate, 'url': '/metrics/mrr-churn-rate'},
      {'fetch': feed.fetchArr, 'url': '/metrics/arr'},
      {'fetch': feed.fetchArpa, 'url': '/metrics/arpa'},
=======
      {'fetch': feed.fetchMrr, 'url': '/metrics/mrr', 'config': {}},
      {
        'fetch': feed.fetchNbCustomers, 'url': '/metrics/customer-count',
        'config': {},
      },
      {
        'fetch': feed.fetchNetMRRChurnRate, 'url': '/metrics/mrr-churn-rate',
        'config': {},
      },
      {'fetch': feed.fetchArr, 'url': '/metrics/arr', 'config': {}},
      {'fetch': feed.fetchArpa, 'url': '/metrics/arpa', 'config': {}},
>>>>>>> remotes/origin/koa
    ];

    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

<<<<<<< HEAD
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
=======
    middlewares.forEach(({fetch, url, config}) => {
      it(`feed.${fetch.name}() should call requestChartMogulFor()`,
        () => {
          return fetch.call(feed, config)
            .then((item) => {
              expect(spyFeedReqChartMogul.called).to.be.true;
              expect(spyFeedReqChartMogul.calledWith(url)).to.be.true;
            });
        });

      it(`feed.${fetch.name}() should fill data with items`, () => {
        return fetch.call(feed, config)
          .then((item) => {
            expect(item).to.not.be.undefined.and.null;
            expect(item).to.be.a('array').and.to.not.be.empty;
            expect(item).to.have.lengthOf(2);
          });
>>>>>>> remotes/origin/koa
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('MiddleWare : fetchMRRMovements', (done) => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

<<<<<<< HEAD
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
=======
    it('should call requestChartMogulFor()', () => {
      return feed.fetchMRRMovements({}, (err) => {
        if (err) return done(err);
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
      });
    });

    it('should fill data with items', () => {
      return feed.fetchMRRMovements({}).then((data) => {
        expect(data).to.contains.all.keys('format', 'unit', 'items');
        expect(data.format).to.be.a('string').and.eq('currency');
        expect(data.unit).to.be.a('string');
        expect(data.items).to.a('array').and.to.not.be.empty;
        // expect(data.items).to.have.lengthOf(4);
>>>>>>> remotes/origin/koa
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('MiddleWare : fetchNetMRRMovements', (done) => {
    let spyCalcNetMRRMovement;
    let mogulFeed;

    beforeEach(() => {
      mogulFeed = new ChartMogulFeed();
      spyFeedReqChartMogul = sinon.spy(mogulFeed, 'requestChartMogulFor');
      spyFindMaxNetMRR = sinon.spy(mogulFeed, 'findMaxNetMRR');
      spyCalcNetMRRMovement = sinon.spy(mogulFeed, 'calcNetMRRMovement');
    });

    afterEach(() => {
      spyFeedReqChartMogul.restore();
      spyCalcNetMRRMovement.restore();
      spyFindMaxNetMRR.restore();
    });

<<<<<<< HEAD
    it('should call requestChartMogulFor()', (done) => {
      mogulFeed.fetchNetMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
        done();
      });
    });

    it('should call findMaxNetMRR() and calcNetMRRMovement()', (done) => {
      const mrrEntries = Config.request.chartMogul.mrr.entries;
      mogulFeed.fetchNetMRRMovements(req, res, (err) => {
        if (err) return done(err);
=======
    it('should call requestChartMogulFor()', () => {
      return mogulFeed.fetchNetMRRMovement({}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
      });
    });

    it('should call findMaxNetMRR() and calcNetMRRMovement()', () => {
      const mrrEntries = Config.request.chartMogul.mrr.entries;
      return mogulFeed.fetchNetMRRMovement({}).then(() => {
>>>>>>> remotes/origin/koa
        expect(spyFindMaxNetMRR.called).to.be.true;
        expect(spyFindMaxNetMRR.calledWith(mrrEntries)).to.be.true;
        expect(spyCalcNetMRRMovement.called).to.be.true;
        expect(spyCalcNetMRRMovement.callCount).to.be.eql(mrrEntries.length);
<<<<<<< HEAD
        done();
      });
    });

    it('should fill data with items', (done) => {
      mogulFeed.fetchNetMRRMovements(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.data).to.contains.all.keys('item');
        expect(res.locals.data.item).to.be.a('array').and.to.not.be.empty;
        done();
=======
      });
    });

    it('should fill data with items', () => {
      return mogulFeed.fetchNetMRRMovement({}).then((item) => {
        expect(item).to.be.a('array').and.to.not.be.empty;
>>>>>>> remotes/origin/koa
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('MiddleWare : fetchNbLeads', () => {
    let spyFetchAndFilter;
    beforeEach(() => {
      spyFetchAndFilter = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFetchAndFilter.restore());


<<<<<<< HEAD
    it('should call fetchAndFilterCustomers', (done) => {
      feed.fetchNbLeads(req, res, (err) => {
        if (err) return done(err);
        expect(spyFetchAndFilter.called).to.be.true;
        expect(spyFetchAndFilter.calledWith(Config.chartMogul.leads.startPage))
          .to.be.true;
        done();
      });
    });

    it('should fill data with items', (done) => {
      feed.fetchNbLeads(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.data).to.contains.all.keys('item');
        expect(res.locals.data.item).to.be.a('array').and.to.not.be.empty;
        expect(res.locals.data.item).to.have.lengthOf(2);
        done();
=======
    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchNbLeads({}).then((item) => {
        expect(spyFetchAndFilter.called).to.be.true;
        expect(spyFetchAndFilter.calledWith(Config.chartMogul.leads.startPage))
          .to.be.true;
      });
    });

    it('should fill data with items', () => {
      return feed.fetchNbLeads({}).then((item) => {
        expect(item).to.be.a('array').and.to.not.be.empty;
        expect(item).to.have.lengthOf(2);
>>>>>>> remotes/origin/koa
      });
    });
  });


  after(() => superagentMock.unset());
});
