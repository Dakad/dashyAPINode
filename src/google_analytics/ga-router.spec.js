/* eslint-disable new-cap */

/**
 * TDD for the GARouter.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const {expect} = require('chai');
// const sinon = require('sinon');
const Supertest = require('supertest');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
const Server = require('../components/server');
const Util = require('../components/util');

const GARouter = require('../google_analytics/ga-router');
const GAFeeder = require('../google_analytics/ga-feeder');

const mockReqConf = require('./ga-superagent-mock-config');

// -------------------------------------------------------------------
// Properties
const feed = new GAFeeder();
const server = new Server(0);


let openedServer;
let superagentMock;
let router;
// let next;

// -------------------------------------------------------------------
// Test Units


describe('ChartMogul : Router', () => {
  before(() => superagentMock = mockRequest(request, mockReqConf,
    (log) => console.log('superagent call', log.url)));

  after(() => superagentMock.unset());


  it('should have the url path set to /ga', () => {
    router = new GARouter(feed);
    expect(router.getURL()).to.not.be.null;
  });

  describe.skip('configByParams', () => {
    let ctx = {body: {}, state: {}, status: 404};

    beforeEach(() => {
      ctx = {body: {}, state: {config: {}}, status: 404};
    });

    it('should return a object', (done) => {
      router.configByParams(ctx, () => {
        expect(ctx.state).to.have.property('config');
        done();
      });
    });

    it.skip('should return an object with the default params', (done) => {
      const dates = Util.getAllDates();

      return router.configByParams(ctx, () => {
        expect(ctx.state.config)
          .to.contains.all.keys([
            'start-date', 'end-date', 'last-start-date', 'last-end-date',
          ]);
        expect(ctx.state.config['end-date'])
          .to.be.eql(Util.convertDate(dates));
        expect(ctx.state.config['start-date'])
          .to.be.equal(Util.convertDate(dates));
        expect(ctx.state.config['interval']).to.be.eql('month');
        done();
      });
    });
  });


  describe('Call the routes with the server', () => {
    beforeEach((done) => {
      router = new GARouter(feed);
      server.initRouters(router.init());
      server.init().then(() => {
        openedServer = server.getApp().listen();
      }).done(done);
    });

    afterEach((done) => {
      openedServer.close();
      done();
    });

    it('check if mount the router', () => {
      Supertest(openedServer)
        .get('/ga/zen')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('joke');
          expect(body.joke).to.be.a('string');
        });
    });


    it('/visitors/unique', (done) => {
      Supertest(openedServer)
        .get('/ga/visitors/unique')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('item');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/session/duration/avg', (done) => {
      Supertest(openedServer)
        .get('/ga/session/duration/avg')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('absolute', 'item');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/bounce_rate', (done) => {
      Supertest(openedServer)
        .get('/ga/bounce_rate')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('absolute', 'item');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });


    it('/blog/views', (done) => {
      Supertest(openedServer)
        .get('/ga/blog/views')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('absolute', 'item');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });


    it('/blog/duration', (done) => {
      Supertest(openedServer)
        .get('/ga/blog/duration')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('absolute', 'item');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });


    it('/blog/most', (done) => {
      Supertest(openedServer)
        .get('/ga/blog/most')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('items');
          expect(body.items).to.be.a('array')
            .and.to.have.lengthOf(10);
        })
        .end(done);
    });


    it.skip('/acq/src', (done) => {
      Supertest(openedServer)
        .get('/ga/acq/src?format=list')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object')
            .and.to.contains.all.keys('format', 'unit', 'items');
          expect(body.items).to.be.a('array');
        })
        .end(done);
    });
  });
});
