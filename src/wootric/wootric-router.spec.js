/* eslint-disable new-cap */

/**
 * TDD for the Wootric Router.
 */


// -------------------------------------------------------------------
// Dependencies
// Packages
const {
  expect,
} = require('chai');
const sinon = require('sinon');
const Supertest = require('supertest');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-in

// Mine
const Server = require('../components/server');
// const Util = require('../components/util');

const WootricRouter = require('./wootric-router');
const WootricFeeder = require('./wootric-feeder');

const mockReqConf = require('./wootric-superagent-mock-config');

// -------------------------------------------------------------------
// Properties
const feed = new WootricFeeder();
const server = new Server(0);

// let ctx;
let openedServer;
let superagentMock;
let router;
// let stubRouterInitPusher;


// -------------------------------------------------------------------
// Test Units


describe('Wootric : Router', () => {
    before(() => {
    superagentMock = mockRequest(request, mockReqConf,
      (log) => console.log('SUPERMockAgent call Wootric API', log.url));
  });

  after(() => superagentMock.unset());


  it('should have the url path set to /wootric', () => {
    router = new WootricRouter(feed);
    sinon.stub(router, 'initPusher').callsFake(() => null);
    expect(router.getURL()).to.not.be.null;
  });

  describe('Call the routes with the server', () => {
    beforeEach((done) => {
      router = new WootricRouter(feed);
      sinon.stub(router, 'initPusher').callsFake(() => null);
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
        .get('/wootric/zen')
        .expect(200)
        .expect(({
          body,
        }) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('joke');
          expect(body.joke).to.be.a('string');
        });
    });


    it('/wootric/nps', (done) => {
      Supertest(openedServer)
        .get('/wootric/nps')
        .expect(200)
        .expect(({
          body,
        }) => {
          expect(body).to.be.a('object');
          expect(body).to.contains.all.keys('items');
          expect(body.items).to.be.a('array')
            .and.to.have.lengthOf(4);
        })
        .end(done);
    });
  });
});
