/**
 * TDD for the PipedriveFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

// Built-in

// Mine


// -------------------------------------------------------------------
// Properties

const PipeDriveFeed = require('./pipedrive-feed');
const feed = new PipeDriveFeed();

describe('Feeder : Pipedrive', () => {
  const url = '/pipedrive';
  const req = httpMocks.createRequest({
    method: 'GET',
    url: url + '/mocky',
  });

  const res = httpMocks.createResponse();
  const cbNextHasConfigPipeline = () => {
    expect(req).to.have.any.keys('config');
    expect(req.config).to.have.all.keys('pipeline');
    expect(req.config.pipeline).to.have.all.keys('id', 'name', 'stages');
    expect(req.config.pipeline.stages)
      .to.have.all.keys('id', 'name', 'pipeline_id');
  };

  it(' should go into firstMiddleware', () => {
    feed.getPipeline(req, res, cbNextHasConfigPipeline);
  });
});
