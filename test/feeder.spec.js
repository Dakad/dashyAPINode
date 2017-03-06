/**
 * Test Unit for the Router component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies

// Packages
// const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');


// Built-in

// Mine
const MockUtil = require('./mocks');


describe('Component : Feeder', () => {
  const url = '/';
  const req = httpMocks.createRequest({
    method: 'GET',
    url: url + '/mocky',
  });

  const res = httpMocks.createResponse();
  const feed = MockUtil.getFeeder();
  
  it('should go through the checkParams middleware', (done) => {
    feed.checkParams(req,res,(err) => {
      if(err) return done();
      // expect(req).to.have.any.keys('config');
      // expect(req.config).to.have.any.keys('api_token', 'pipeline');
      done();
    })
  });
});
