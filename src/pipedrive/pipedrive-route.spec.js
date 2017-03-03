/**
 * TDD for the PipedriveRouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');

// Built-in

// Mine
const PipeDriveRouter = require('./pipedrive-route');

describe('PipeDrive : Router', () => {
  const url = '/piped/';
  let router;

  beforeEach(() => router = new PipeDriveRouter(url));

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
      PipeDriveRouter.getPipeline(req, res, cbNextHasConfigPipeline);
    });
  });
});

