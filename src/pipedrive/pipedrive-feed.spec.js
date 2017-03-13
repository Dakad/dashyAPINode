/**
 * Unit Test  for the PipedriveFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const Config = require('config');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
// const Util = require('../components/util');
const PipeDriveFeed = require('./pipedrive-feed');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties
const superagentMock = mockRequest(request, mockReqConf);
const feed = new PipeDriveFeed();
chai.use(chaiAsPromised);
const expect = chai.expect;


// -------------------------------------------------------------------
// Test Units


describe('Pipedrive : Feeder', () => {
  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/mocky',
  });

  const res = httpMocks.createResponse();
  res.locals = {};


  describe('requestPipeDriveFor', () => {
    const query = {
      api_token: 'PIPEDRIVE_API_TOKEN',
      pipeline: 123,
    };
    let req;

    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request, 'get');
    });

    afterEach(() => spySuperAgent.restore());

    after(() => superagentMock.unset());

    it('should use request.get', (done) => {
      feed.requestPipeDriveFor('reqMe', query)
        .done((res) => {
          expect(spySuperAgent.called).to.be.true;
          done();
        }, (err) => done());
    });

    it('should return a Promise.rejected -  args:undefinied', (done) => {
      req = feed.requestPipeDriveFor();
      expect(req.catch).to.be.a('function');
      expect(req).to.be.rejected.notify(done);
    });

    it('should return a Promise.rejected - args[dest]:undefined', (done) => {
      req = feed.requestPipeDriveFor(null, query);
      expect(req.catch).to.be.a('function');
      expect(req).to.be.rejected.notify(done);
    });

    it('should return a Promise.rejected - args[dest]:pipe/deals', (done) => {
      req = feed.requestPipeDriveFor('/pipe/deals');
      expect(req).to.be.rejected.notify(done);
      expect(req.catch).to.be.a('function');
    });

    it('should return a Promise.fullfied - /pipeline', (done) => {
      req = feed.requestPipeDriveFor('/pipelines', query);
      expect(req).to.be.fulfilled;
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
      expect(req.then).to.be.a('function');
      req.done((data) => {
        expect(data).to.equal(Config.request.pipedrive.pipelines);
        done();
      });
    });
  });


  describe('firstMiddleware', () => {
    let superagentMock;
    let spyReqPipeDrive;

    beforeEach(() => {
      superagentMock = mockRequest(request, mockReqConf);
      spyReqPipeDrive = sinon.spy(feed, 'requestPipeDriveFor');
    });

    afterEach(() => spyReqPipeDrive.restore());

    it('should go into firstMiddleware', (done) => {
      feed.getPipeline(req, res, (err) => {
        if (err) return done(err);
        expect(spyReqPipeDrive.called).to.be.true;
        expect(spyReqPipeDrive.callCount).to.be.eq(2);

        expect(spyReqPipeDrive.getCall(0).args[0])
          .to.be.eql('/pipelines');

        expect(spyReqPipeDrive.getCall(1).args[0])
          .to.be.eql('/stages');
        done(err);
      });
    });

    it(' should go into firstMiddleware - locals', (done) => {
      feed.getPipeline(req, res, (err) => {
        if (err) return done(err);
        expect(res).to.have.any.keys('locals');
        expect(res.locals)
          .to.have.any.keys('api_token', 'pipeline', 'pipeline_id');
        done();
      });
    });

    it(' should go into firstMiddleware - pipeline', (done) => {
      feed.getPipeline(req, res, (err) => {
        if (err) return done(err);
        expect(res.locals.pipeline).to.have.any.keys('id', 'name', 'stages');
        done();
      });
    });

    it(' should go into firstMiddleware - stages', (done) => {
      feed.getPipeline(req, res, (err, res) => {
        if (err) return done();
        expect(res.locals.pipeline.stages).to.be.an('array');
        expect(res.locals.pipeline.stages[0])
          .to.have.any.keys('id', 'name');
        done();
      });
    });

    after(() => superagentMock.unset());
  });
});
