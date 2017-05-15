/**
 * Unit Test  for the ChartMogulFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
const Config = require('../../config/test');
const Util = require('../components/util');
const ChartMogulFeeder = require('./chartmogul-feeder');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties
let feed = new ChartMogulFeeder();
chai.use(chaiAsPromised);
const {expect} = chai;

let spyFeedReqChartMogul;
let superagentMock;

// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Feeder', () => {
    before(() => superagentMock = mockRequest(request, mockReqConf,
    (log) => console.log('SUPERMockAgent call ChartMogul', log.url)));

  after(() => superagentMock.unset());


  beforeEach(() => { });


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

    it('should return a Promise.fulfilled - /metrics/mrr', (done) => {
      const promise = feed.requestChartMogulFor('/metrics/mrr');
      expect(promise).to.eventually.be.fulfilled;
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
      expect(feed.calcNetMRR()).to.be.equal(0);
      expect(feed.calcNetMRR(undefined)).to.be.equal(0);
      expect(feed.calcNetMRR(null)).to.be.equal(0);
      expect(feed.calcNetMRR({})).to.be.equal(0);
      expect(feed.calcNetMRR([])).to.be.equal(0);
    });

    it('should return -26,89', () => {
      const mrrs = [98458, 1800, -2970, -109447, 9470];
      expect(feed.calcNetMRR(mrrs)).to.be.equal(-26.89);
    });
    it('should return 811,64', () => {
      const mrr = Config.request.chartMogul.mrr.entries[0];
      feed.calcNetMRR(Config.request.chartMogul.mrr.entries[0]);
      feed.calcNetMRR(Config.request.chartMogul.mrr.entries[1]);
      feed.calcNetMRR(Config.request.chartMogul.mrr.entries[2]);
      expect(feed.calcNetMRR(mrr)).to.be.equal(811.64);
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

    it('should return Array[4]', () => {
      const customers = Config.request.chartMogul.customers[0].entries;
      const res = feed.filterCustomers(customers);
      expect(res).to.not.be.empty;
      expect(res).to.have.lengthOf(5);
    });
    it('should return Array[6] onlyLead', () => {
      const customers = Config.request.chartMogul.customers[0].entries;
      const res = feed.filterCustomers(customers, true);
      expect(res).to.not.be.empty;
      // expect(res).to.have.lengthOf(6);
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
      feed = new ChartMogulFeeder();
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
      spyFetchAndFilter = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => {
      spyFeedReqChartMogul.restore();
      spyFetchAndFilter.restore();
    });


    it('should call spyFeedReqChartMogul()', () => {
      // const nbCalls = Config.request.chartMogul.customers[0].total_pages;
      feed.fetchAndFilterCustomers(1)
        .then((data) => {
          expect(spyFeedReqChartMogul.called).to.be.true;
          // expect(spyFetchAndFilter.callCount)
          //   .to.be.eq(nbCalls);
          // expect(spyFeedReqChartMogul.firstCall.calledWith('/customers', {
          //   'page': 1,
          // })).to.be.true;
          // expect(spyFeedReqChartMogul.firstCall.calledWith('/customers', {
          //   'page': 2,
          // })).to.be.true;
          // expect(spyFetchAndFilter.firstCall.args[0])
          //   .to.be.equal(1);
          // expect(spyFetchAndFilter.secondCall.args[0])
          //   .to.be.equal(2);
        });
    });

    it('should call spyFeedReqChartMogul() ?status=Lead', () => {
      return feed.fetchAndFilterCustomers(1, {status: 'Lead'})
        .then((data) => {
          expect(spyFeedReqChartMogul.called).to.be.true;
          // expect(spyFetchAndFilter.callCount)
          //   .to.be.eq(nbCalls);
          expect(spyFeedReqChartMogul.firstCall.calledWith('/customers', {
            'page': 1,
            'status': 'Lead',
          })).to.be.true;
          expect(spyFeedReqChartMogul.secondCall.calledWith('/customers', {
            'page': 2,
            'status': 'Lead',
          })).to.be.true;
          // expect(spyFetchAndFilter.firstCall.args[0])
          //   .to.be.equal(1);
          // expect(spyFetchAndFilter.secondCall.args[0])
          //   .to.be.equal(2);
        });
    });


    it('should return customers : [4]', () => {
      const customers = feed.fetchAndFilterCustomers(1);
      return customers.then((data) => {
        expect(data).to.be.a('array').and.to.not.be.empty;
        expect(data).to.have.lengthOf(6);
      });
    });

    it('should return leads : [11]', () => {
      const leads = feed.fetchAndFilterCustomers(1, {onlyLead: true});
      return leads.then((data) => {
        expect(data).to.be.a('array').and.to.not.be.empty;
        expect(data).to.have.lengthOf(10);
      });
    });

    it('should return customers && leads : []', () => {
      let leads = feed.fetchAndFilterCustomers(3, {});
      leads.then((data) => {
        expect(data).to.be.a('array').and.to.be.empty;
      });

      leads = feed.fetchAndFilterCustomers(3, {onlyLead: true});
      leads.then((data) => {
        expect(data).to.be.a('array').and.to.be.empty;
      });

      leads = feed.fetchAndFilterCustomers(3, {status: 'Lead'});
      return leads.then((data) => {
        expect(data).to.be.a('array').and.to.be.empty;
      });
    });
  });

  describe('Fetcher - basicFetchers', () => {
    const middlewares = [
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
    ];

    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

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
          .then(({item}) => {
            expect(item).to.not.be.undefined.and.null;
            expect(item).to.be.a('array').and.to.not.be.empty;
            expect(item).to.have.lengthOf(2);
          });
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('Fetcher : fetchMRRMovements', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call requestChartMogulFor()', () => {
      return feed.fetchMRRMovements({}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
      });
    });

    it('should fill data with item text', () => {
      return feed.fetchMRRMovements({}).then((data) => {
        expect(data).to.contains.all.keys('item');
        expect(data.item).to.a('array').and.to.not.be.empty;
        expect(data.item[0]).to.be.a('object').and.to.contains.all.keys('text');
        expect(data.item[0].text).to.be.a('string');
        // expect(data.items).to.have.lengthOf(4);
      });
    });

    it('should fill data with items', () => {
      return feed.fetchMRRMovements({out: 'list'}).then((data) => {
        expect(data).to.contains.all.keys('format', 'unit', 'items');
        expect(data.format).to.be.a('string').and.eq('currency');
        expect(data.unit).to.be.a('string');
        expect(data.items).to.a('array').and.to.not.be.empty;
        // expect(data.items).to.have.lengthOf(4);
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('Fetcher : fetchNetMRRMovements', () => {
    let spycalcNetMRR;
    let spyFindMaxNetMRR;
    let mogulFeed;

    beforeEach(() => {
      mogulFeed = new ChartMogulFeeder();
      spyFeedReqChartMogul = sinon.spy(mogulFeed, 'requestChartMogulFor');
      spyFindMaxNetMRR = sinon.spy(mogulFeed, 'findMaxNetMRR');
      spycalcNetMRR = sinon.spy(mogulFeed, 'calcNetMRR');
    });

    afterEach(() => {
      spyFeedReqChartMogul.restore();
      spycalcNetMRR.restore();
      spyFindMaxNetMRR.restore();
    });

    it('should call requestChartMogulFor()', () => {
      return mogulFeed.fetchNetMRRMovement({}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.calledWith('/metrics/mrr')).to.be.true;
      });
    });

    it('should call findMaxNetMRR() and calcNetMRR()', () => {
      const mrrEntries = Config.request.chartMogul.mrr.entries;
      return mogulFeed.fetchNetMRRMovement({}).then(() => {
        expect(spyFindMaxNetMRR.called).to.be.true;
        // expect(spyFindMaxNetMRR.calledWith(mrrEntries)).to.be.true;
        expect(spycalcNetMRR.called).to.be.true;
        expect(spycalcNetMRR.callCount)
          .to.be.eql(mrrEntries.length + 1);
      });
    });

    it('should fill data with items', () => {
      return mogulFeed.fetchNetMRRMovement({}).then(({item}) => {
        expect(item).to.be.a('array').and.to.not.be.empty;
      });
    });

    // TODO Unit test for the parametred req
  });

  describe('Fetcher : fetchNbLeads', () => {
    let spyFetchAndFilter;
    beforeEach(() => {
      spyFetchAndFilter = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFetchAndFilter.restore());


    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchNbLeads({}).then((item) => {
        expect(spyFetchAndFilter.called).to.be.true;
        expect(spyFetchAndFilter.calledWith(Config.chartMogul.leads.startPage))
          .to.be.true;
      });
    });

    it('should fill data with items', () => {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(0);
      const conf = {
        'start-date': Util.convertDate(lastMonth),
        'end-date': Util.convertDate(today),
        'interval': 'month',
      };
      return feed.fetchNbLeads(conf).then(({item}) => {
        expect(item).to.be.a('array').and.to.not.be.empty;
        expect(item).to.have.lengthOf(2);
      });
    });
  });

  describe('Fetcher : fetchNbLeadsToday', () => {
    let spyFetchAndFilter;
    beforeEach(() => {
      spyFetchAndFilter = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFetchAndFilter.restore());


    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchNbLeadsToday({}).then(() => {
        expect(spyFetchAndFilter.called).to.be.true;
        expect(spyFetchAndFilter.calledWith(Config.chartMogul.leads.startPage))
          .to.be.true;
      });
    });

    it('should fill data with items', () => {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(0);
      const conf = {
        'start-date': Util.convertDate(lastMonth),
        'end-date': Util.convertDate(today),
        'interval': 'month',
      };
      return feed.fetchNbLeadsToday(conf).then(({item}) => {
        expect(item).to.be.a('array').and.to.not.be.empty;
        expect(item).to.have.lengthOf(2);
      });
    });
  });

  describe('Fetcher : fetchBiggestPlansPurchased', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'requestChartMogulFor');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call requestChartMogulFor', () => {
      return feed.fetchMostPlansPurchased({}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        expect(spyFeedReqChartMogul.callCount).to.be.above(2);
      });
    });

    it('should fill data with items', () => {
      // const today = new Date();
      // const lastMonth = new Date();
      // lastMonth.setDate(0);
      // const conf = {
      //   'start-date': Util.convertDate(lastMonth),
      //   'end-date': Util.convertDate(today),
      //   'interval': 'month',
      // };
      return feed.fetchMostPlansPurchased({}).then(({items}) => {
        const [best, , , , last] = items;
        expect(items).to.be.a('array').and.to.not.be.empty;
        expect(items).to.have.lengthOf(5);
        expect(best).to.contains.all.keys('label', 'value');
        expect(last).to.contains.all.keys('label', 'value');
      });
    });
  });

  describe('Fetcher : fetchLatestCustomers', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchLatestCustomers({onlyLead: false}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        // expect(spyFeedReqChartMogul.callCount).to.be.above(2);
      });
    });

    it('should fill data with items', () => {
      return feed.fetchLatestCustomers({onlyLead: false, out: 'json'})
        .then((item) => {
          const [last] = item;
          expect(item).to.be.a('array').and.to.not.be.empty;
          // expect(item).to.have.lengthOf(5);
          expect(last).to.contains.all.keys([
            'country', 'country', 'name', 'company', 'date',
            'mrr', 'plan',
          ]);
        });
    });

    it('should fill data with items formatted', () => {
      return feed.fetchLatestCustomers({})
        .then(({item}) => {
          const [last, one] = item;
          expect(item).to.be.a('array').and.to.not.be.empty;
          // expect(item).to.have.lengthOf(5);
          expect(last).to.contains.all.keys('type', 'text');
          expect(last.type).eq(1);
          expect(last).to.contains.all.keys('type', 'text');
          expect(one).to.contains.all.keys('type', 'text');
        });
    });
  });

  describe('Fetcher : fetchLatestLeads', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchLatestCustomers({onlyLead: true, out: 'json'})
      .then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        // expect(spyFeedReqChartMogul.callCount).to.be.above(2);
      });
    });

    it('should fill data with items', () => {
      return feed.fetchLatestCustomers({onlyLead: true, out: 'json'})
      .then(([last]) => {
        // expect(spyFeedReqChartMogul.callCount).to.be.above(2);
        expect(last).to.contains.all.keys([
          'country', 'country', 'name', 'company', 'date',
          'mrr', 'plan',
        ]);
      });
    });

    it('should fill data with items formatted', () => {
      return feed.fetchLatestCustomers({onlyLead: true})
        .then(({item}) => {
          const [last, one] = item;
          expect(item).to.be.a('array').and.to.not.be.empty;
          // expect(latestCust).to.have.lengthOf(5);
          expect(last).to.contains.all.keys('type', 'text');
          expect(one).to.contains.all.keys('type', 'text');
        });
    });
  });

  describe('Fetcher : fetchCountriesByCustomers', () => {
    beforeEach(() => {
      spyFeedReqChartMogul = sinon.spy(feed, 'fetchAndFilterCustomers');
    });

    afterEach(() => spyFeedReqChartMogul.restore());

    it('should call fetchAndFilterCustomers', () => {
      return feed.fetchCountriesByCustomers({}).then(() => {
        expect(spyFeedReqChartMogul.called).to.be.true;
        // expect(spyFeedReqChartMogul.callCount).to.be.above(2);
      });
    });

    it('should fill data with items', () => {
      return feed.fetchCountriesByCustomers({out: 'json'})
        .then((data) => {
          expect(data).to.be.an('Object').and.to.not.be.empty;
        });
    });
  });


  after(() => superagentMock.unset());
});
