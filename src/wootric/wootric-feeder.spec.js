/**
 * Unit Test  for the WootricFeeder.
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

// const Util = require('../components/util');
const WootricFeeder = require('./wootric-feeder');
const mockReqConf = require('./wootric-superagent-mock-config');


// -------------------------------------------------------------------
// Properties
let feed = new WootricFeeder();
chai.use(chaiAsPromised);
const {
  expect,
} = chai;

let spyFeedReqWootric;
let superagentMock;

// -------------------------------------------------------------------
// Test Units


describe('Wootric : Feeder', () => {
  before(() => superagentMock = mockRequest(request, mockReqConf,
    (log) => console.log('SUPERMockAgent call Wootric', log.url)));

  after(() => superagentMock.unset());

  beforeEach(() => {});


  describe('requestWootricForToken', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'post');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a Promise', (done) => {
      const promise = feed.requestWootricForToken();
      expect(spySuperAgent.called).to.be.true;
      expect(promise).to.not.be.undefined.and.null;
      expect(promise.then).to.be.a('function');
      expect(promise.catch).to.be.a('function');
      done();
    });

    it('should return a Promise.fulfilled with an oauth Token', (done) => {
      const promise = feed.requestWootricForToken();
      expect(promise).to.eventually.be.fulfilled;
      expect(promise)
        .to.eventually.contains.all.keys([
          'access_token',
          'created_at',
          'expires_in',
          'scope',
          'token_type',
        ])
        .and.notify(done);
    });
  });

  describe('getAccessToken', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'post');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a token', () => {
      const token = feed.getAccessToken();
      expect(token).to.eventually.be.fulfilled;
      expect(token).to.eventually.be.a('string').and.not.be.empty;
    });
  });


  describe('requestWootricFor', () => {
    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'get');
    });

    afterEach(() => spySuperAgent.restore());

    it('should returns a Promise', () => {
      let prom;
      try {
        prom = feed.requestWootricFor();
      } catch (err) {
        expect(prom).to.not.be.undefined.and.null;
        expect(prom).to.eventually.be.rejected;
        expect(prom.then).to.be.a('function');
        expect(prom.catch).to.be.a('function');
      }
    });


    it('should return a Promise.fulfilled - /nps_summary', () => {
      const promise = feed.requestWootricFor('/nps_summary');
      expect(promise).to.eventually.be.fulfilled;
      expect(promise)
        .to.eventually.contains.all.keys([
          'nps',
          'responses',
          'detractors',
          'passives',
          'promoters',
          'response_rate',
          'email_response_rate',
        ]);
    });
  });


  describe('Fetcher : fetchNPS', () => {
    beforeEach(() => {
      spyFeedReqWootric = sinon.spy(feed, 'requestWootricFor');
    });

    afterEach(() => spyFeedReqWootric.restore());


    it('should call requestWootricFor', () => {
      return feed.fetchNPS({}).then(() => {
        expect(spyFeedReqWootric.called).to.be.true;
      });
    });

    it('should fill data with items', () => {
      return feed.fetchNPS({}).then((data) => {
        const {
        items,
      } = data;
        expect(data).to.not.be.empty;
        expect(data).to.contains.all.keys(['format', 'items']);
        expect(items).to.be.a('array').and.to.not.be.empty;
        expect(items).to.have.lengthOf(4);
      });
    });
  });
});
