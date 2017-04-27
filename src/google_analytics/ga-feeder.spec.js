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
const Util = require('../components/util');
const GAFeed = require('./ga-feeder');
const mockReqConf = require('./ga-superagent-mock-config');


// -------------------------------------------------------------------
// Properties

let feed = new GAFeed();
chai.use(chaiAsPromised);
const {
  expect,
} = chai;

// let spyFeedReqGA;
let superagentMock = mockRequest(request, mockReqConf,
  ({
    method,
    url,
  }) => console.log('superagentMock call', method, url));


const dates = Util.getAllDates();

// -------------------------------------------------------------------
// Test Units


describe('GoogleAnalytics : Feeder', () => {
  before(() => {
    // sinon.stub(feed,
    //   'getAccessToken',
    //   () => Promise.resolve('GA_ACCESS_TOKEN')
    // );
  });
  after(() => superagentMock.unset());

  beforeEach(() => {});

  describe('requestGoogleAnalyticsFor', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'get');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a Promise.rejected', (done) => {
      const promise = feed.requestGAFor();
      expect(promise).to.eventually.not.be.undefined.and.null;
      expect(promise).to.eventually.be.rejected;
      promise.catch((err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });
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


  describe('[private Functions] - ', () => {
    describe('flatFilters', () => {
      it('should return null on invalid args', () => {
        expect(feed.flatFilters(undefined)).to.be.null;
        expect(feed.flatFilters(null)).to.be.null;
        expect(feed.flatFilters('Abcdf')).to.be.null;
        expect(feed.flatFilters({
          'a': 1,
          'b': 2,
          'c': 'd',
        })).to.be.null;
      });

      it('should return string', () => {
        expect(feed.flatFilters(['a', 'b', 'c', 'd'])).to.be.a('string')
          .and.be.eq('abcd');
        expect(feed.flatFilters([
            ['a', 'b'],
            ['c'],
            ['d', 'e'],
          ]))
          .to.be.a('string')
          .and.eql('abcde');
        expect(feed.flatFilters([
            ['a', 'b'],
            ['c'],
            ['d', 'e'],
          ], 'AND'))
          .to.be.a('string')
          .and.eql('ab;c;de;');
        expect(feed.flatFilters([
            ['a', 'b'],
            ['c'],
            ['d', 'e'],
          ], 'OR'))
          .to.be.a('string')
          .and.eql('ab,c,de,');
      });
    });
  });


  describe('[Fetchers] -', () => {
    let spyFeedReqGA;
    let config = {};

    before(() => {
      config = {
        'last-start-date': Util.convertDate(dates.firstInPastMonth),
        'last-end-date': Util.convertDate(dates.dateInPastMonth),
        'start-date': Util.convertDate(dates.firstInMonth),
        'end-date': Util.convertDate(dates.today),
      };
    });

    beforeEach(() => {
      spyFeedReqGA = sinon.spy(feed, 'requestGAFor');
    });

    afterEach(() => spyFeedReqGA.restore());


    describe('fetchNbUniqueVisitors', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchNbUniqueVisitors(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
          expect(spyFeedReqGA.callCount).eql(2);
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchNbUniqueVisitors(config).then(({
          item,
        }) => {
          console.log(item);
          expect(item).to.be.a('array').and.to.not.be.empty;
          expect(item).to.have.lengthOf(2);
        });
      });
    });


    describe('fetchSessionDuration', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchSessionDuration(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
          expect(spyFeedReqGA.callCount).eql(2);
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchSessionDuration(config).then(({item}) => {
          expect(item).to.be.a('array').and.to.not.be.empty;
          expect(item).to.have.lengthOf(2);
          expect(item[0]).to.contains.all.keys(['type', 'value']);
          expect(item[0].type).eql('time_duration');
        });
      });
    });


    describe('fetchBounceRate', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchBounceRate(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
          expect(spyFeedReqGA.callCount).eql(2);
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchBounceRate(config).then(({
          item,
        }) => {
          console.log(item);
          expect(item).to.be.a('array').and.to.not.be.empty;
          expect(item).to.have.lengthOf(2);
        });
      });
    });


    describe('fetchBlogPageViews', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchBlogPageViews(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
          expect(spyFeedReqGA.callCount).eql(2);
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchBlogPageViews(config).then(({
          item,
        }) => {
          expect(item).to.be.a('array').and.to.not.be.empty;
          expect(item).to.have.lengthOf(2);
        });
      });
    });


    describe('fetchBlogPageAVGDuration', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchBlogPageAVGDuration(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
          expect(spyFeedReqGA.callCount).eql(2);
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchBlogPageAVGDuration(config).then(({item}) => {
          expect(item).to.be.a('array').and.to.not.be.empty;
          expect(item).to.have.lengthOf(2);
          expect(item[0]).to.contains.all.keys(['type', 'value']);
          expect(item[0].type).eql('time_duration');
        });
      });
    });


    describe('fetchMostBlogPost', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchMostBlogPost(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchMostBlogPost(config).then(({
          items,
        }) => {
          expect(items).to.be.a('array').and.to.not.be.empty;
          expect(items).to.have.lengthOf(10);
        });
      });
    });


    describe('fetchBestAcquisitionSrc', () => {
      it('should call requestGoogleAnalyticsFor()', () => {
        return feed.fetchBestAcquisitionSrc(config).then(() => {
          expect(spyFeedReqGA.called).to.be.true;
        });
      });

      it('should return corresponding data to widget format ', () => {
        return feed.fetchBestAcquisitionSrc(config).then((data) => {
          console.log(data);
          // expect(items).to.be.a('array').and.to.not.be.empty;
          // expect(items).to.have.lengthOf(10);
        });
      });
    });
  });
});
