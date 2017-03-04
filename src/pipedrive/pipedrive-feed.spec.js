/**
 * TDD for the PipedriveFeeder.
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
// const sinon = require('sinon');

// Built-in

// Mine


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
  // let cbNext = null;

  it(' should go into firstMiddleware - config', () => {
    feed.getPipeline(req, res, (request, res) => {
      expect(req).to.have.any.keys('config');
      expect(req.config).to.have.any.keys('api_token', 'pipeline');
    });
  });

  // it(' should go into firstMiddleware - pipeline', () => {
  //   feed.getPipeline(req, res, (request, res) => {
  //     expect(req.config.pipeline).to.have.any.keys('id', 'name', 'stages');
  //     expect(req.config.pipeline)
  //       .to.have.any.keys('id', 'name', 'pipeline_id');
  //   });
  // });

  // it(' should go into firstMiddleware - stages', () => {
  //   feed.getPipeline(req, res, (request, res) => {
  //     expect(req.config.pipeline.stages).to.be.an('array');
  //     expect(req.config.pipeline.stages[0])
  //       .to.have.any.keys('id', 'name');
  //   });
  // });
});
