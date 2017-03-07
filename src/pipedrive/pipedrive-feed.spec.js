/**
 * TDD for the PipedriveFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const request = require('superagent');

// Built-in

// Mine
const Util = require('../components/util');

// -------------------------------------------------------------------
// Properties
const PipeDriveFeed = require('./pipedrive-feed');
const feed = new PipeDriveFeed();

describe('Pipedrive : Feeder', () => {
  const url = '/pipedrive';
  const req = httpMocks.createRequest({
    method: 'GET',
    url: url + '/mocky',
  });

  const res = httpMocks.createResponse();

  // let stubRequest;
  let spyUtilReqPipeDrive;

  before(() => {
    stubRequest = sinon.stub(request, 'end', () => console.log('WESSSH'));

    // .yields(null, null, JSON.stringify({login: 'bulkan'}));

    spyUtilReqPipeDrive = sinon.spy(Util, 'requestPipeDriveFor');
  });

  after(function() {
    spyUtilReqPipeDrive.restore();
    request.end.restore();
  });

  describe('firstMiddleware', () => {
    it('should go into firstMiddleware', () => {
      feed.getPipeline(req, res, () => {
        expect(spyUtilReqPipeDrive.called).to.be.true;
        expect(spyUtilReqPipeDrive.callCount).to.be.eq(2);

        expect(spyUtilReqPipeDrive.getCall(0).args[0])
          .to.be.eql('/pipelines');

        expect(spyUtilReqPipeDrive.getCall(1).args[0])
          .to.be.eql('/stages');
      });
    });

    it(' should go into firstMiddleware - config', (done) => {
      feed.getPipeline(req, res, (err, res) => {
        if (err) return done(err);
        expect(req).to.have.any.keys('config');
        expect(req.config).to.have.any.keys('api_token', 'pipeline');
      });
    });

    it(' should go into firstMiddleware - pipeline', (done) => {
      feed.getPipeline(req, res, (err) => {
        if (err) return done(err);
        expect(req.config.pipeline).to.have.any.keys('id', 'name', 'stages');
        expect(req.config.pipeline)
          .to.have.any.keys('id', 'name', 'pipeline_id');
      });
    });

    it(' should go into firstMiddleware - stages', (done) => {
      feed.getPipeline(req, res, (err, res) => {
        if (err) return done();
        expect(req.config.pipeline.stages).to.be.an('array');
        expect(req.config.pipeline.stages[0])
          .to.have.any.keys('id', 'name');
      });
    });
  });
});
