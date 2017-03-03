/**
 * TDD for the PipedriveRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
// const httpMocks = require('node-mocks-http');

// Built-in

// Mine
const MockPipeFeed = require('./pipedrive-feed-mock');
const PipeDriveRouter = require('./pipedrive-route');


describe('PipeDrive : Router', () => {
  const pipeFeed = new MockPipeFeed();
  const url = '/piped/';
  let router;

  beforeEach(() => router = new PipeDriveRouter(url, pipeFeed));

  it('should have a path(url) to be called on', () => {
    expect(router.getURL()).to.be.equal(url);
  });

  it('should not thrown a TypeError on handler()', () => {
    try {
      router.handler();
      expect(true).to.be.ok;
    } catch (error) {
      expect(error).to.not.be.instanceof(TypeError);
    }
  });

  describe('Middleware', () => {
    // const req = httpMocks.createRequest({
    //   method: 'GET',
    //   url: url + '/mocky',
    // });
    // const res = httpMocks.createResponse();
    // const cb = () => {
    // };


    it(' should go into firstMiddleware', () => {

    });
  });
});

