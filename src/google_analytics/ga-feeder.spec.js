/**
 * Unit Test  for the GoogleAnalyticsFeed.
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
// const Config = require('../../config/test');
// const Util = require('../components/util');
const GAFeed = require('./ga-feed');
const mockReqConf = require('./ga-superagent-mock-config');


// -------------------------------------------------------------------
// Properties
let feed = new GAFeed();
chai.use(chaiAsPromised);
const {
  expect,
} = chai;

// let spyFeedReqChartMogul;
let superagentMock = mockRequest(request, mockReqConf,
  ({
    method,
    url,
  }) => console.log('superagentMock call', method, url));

// -------------------------------------------------------------------
// Test Units


describe('GoogleAnalytics : Feeder', () => {
  before(() => {
    // sinon.stub(feed,
    //  'getAccessToken',
    //   () => Promise.resolve('GA_ACCESS_TOKEN')
    // );
  });

  beforeEach(() => {});

  describe('requestGoogleAnalyticsFor', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'get');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a Promise', () => {
      const promise = feed.requestGAFor().catch(console.assert);
      expect(promise).to.eventually.not.be.undefined.and.null;
      expect(promise).to.eventually.be.rejected;

      return promise;
    });


    it('should return a Promise.rejected - args[args]:/mocky', (done) => {
      const promise = feed.requestGAFor();
      expect(promise).to.be.rejected.and.notify(done);
    });

    it('should return a Promise.fulfilled - uniqueVistors', (done) => {
      const query = {
        'start-date': '2017-04-01',
        'end-date': '2017-04-24',
        'metrics': ['ga:newUsers'],
        'filters': ['ga:userType', '=~', 'New'],
      };
      const promise = feed.requestGAFor(query);
      expect(promise).to.eventually.be.fulfilled;
      expect(promise.then).to.be.a('function');
      expect(promise.catch).to.be.a('function');
      expect(promise)
        .to.eventually.contains.all.keys([
          'headers',
          'totals',
          'rows',
        ]).and.notify(done);
    });
  });


  after(() => superagentMock.unset());
});
