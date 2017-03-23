/* eslint-disable new-cap */

/**
 * TDD for the ChartMogulRouter.
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
const ChartMogulFeed = require('./chartmogul-feed');
const ChartMogulRouter = require('./chartmogul-route');
const mockReqConf = require('./superagent-mock-config');

// -------------------------------------------------------------------
// Properties
const feed = new ChartMogulFeed();
const server = new Server(0);


let ctx = {body: {}, state: {}, status: 404};
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


  it('should have the url path set to /chartmogul', () => {
    router = new ChartMogulRouter(feed);
    expect(router.getURL()).to.not.be.null;
  });

  describe('configByParams', () => {
    beforeEach(() => {
      ctx = {body: {}, state: {}, status: 404};
    });

    it('should return a object', (done) => {
      router.configByParams(ctx, () => {
        expect(ctx.state).to.have.property('config');
        done();
      });
    });

    it('should return an object with the default params', (done) => {
      const currentDate = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentDate.getMonth() - 1);

      return router.configByParams(ctx, () => {
        expect(ctx.state.config)
          .to.have.any.keys('start-date', 'end-date', 'interval');
        expect(ctx.state.config['start-date'])
          .to.be.eql(Util.convertDate(currentDate));
        expect(ctx.state.config['end-date'])
          .to.be.equal(Util.convertDate(lastMonth));
        expect(ctx.state.config['interval']).to.be.eql('month');
        done();
      });
    });
  });


  describe('Call the routes with the server', () => {
    beforeEach((done) => {
      ctx = {body: {}, state: {}, status: 404};

      router = new ChartMogulRouter(feed);
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
        .post('/chartmogul/zen')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'joke');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
          expect(body.joke).to.be.a('string');
        });
    });
    it('should go into handler()', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/leads')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/mrr', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/mrr')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/customers', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/customers')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/mrr/churn', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/mrr/churn')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/mrr/net', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/mrr/net')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(1);
        })
        .end(done);
    });

    it('/mrr/move', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/mrr/move')
        .expect(200)
        .expect(({body}) => {
          console.log(body);
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('object')
            .and.to.contains.all.keys('format', 'unit', 'items');
          expect(body.item.items).to.be.a('array');
        })
        .end(done);
    });

    it('/arr', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/arr')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });

    it('/arpa', (done) => {
      Supertest(openedServer)
        .post('/chartmogul/arpa')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('api', 'item');
          expect(body.api).to.be.eq('GECKOBOARD_WIDGET_API_KEY');
          expect(body.item).to.be.a('array')
            .and.to.have.lengthOf(2);
        })
        .end(done);
    });
  });
});
