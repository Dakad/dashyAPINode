/**
 * Unit Test  for the PipedriveFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
const Util = require('../components/util');
const mockReqConf = require('./superagent-mock-config');


// -------------------------------------------------------------------
// Properties

let superagentMock = mockRequest(request, mockReqConf);
const PipeDriveFeed = require('./pipedrive-feed');
const feed = new PipeDriveFeed();


// -------------------------------------------------------------------
// Test Units


describe('Pipedrive : Feeder', () => {
  const url = '/pipedrive';
  const req = httpMocks.createRequest({
    method: 'GET',
    url: url + '/mocky',
  });


  const res = httpMocks.createResponse();
  res.locals = {};
  let spyUtilReqPipeDrive;

  beforeEach(() => {
    spyUtilReqPipeDrive = sinon.spy(Util, 'requestPipeDriveFor');
  });

  after(function() {
    spyUtilReqPipeDrive.restore();
    superagentMock.unset();
  });

  describe('firstMiddleware', () => {
    it('should go into firstMiddleware', (done) => {
      feed.getPipeline(req, res, (err) => {
        if (err) return done(err);
        expect(spyUtilReqPipeDrive.called).to.be.true;
        expect(spyUtilReqPipeDrive.callCount).to.be.eq(2);

        expect(spyUtilReqPipeDrive.getCall(0).args[0])
          .to.be.eql('/pipelines');

        expect(spyUtilReqPipeDrive.getCall(1).args[0])
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
  });
});
