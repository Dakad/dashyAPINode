'use strict';
/* eslint-disable new-cap */
/**
 * @overview Unit Test for BaseRouter
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const {expect} = require('chai');
const httpMocks = require('node-mocks-http');
const Supertest = require('supertest');

// Built-in

// Mine
const Server = require('../components/server');
const BaseRouter = require('./baserouter');
// -------------------------------------------------------------------
// Properties
const server = new Server(0);
let baseRouter;
let openedServer;

// -------------------------------------------------------------------
// Test


describe('Base : BaseRouter', () => {
  beforeEach(() => baseRouter = BaseRouter.getInstance());

  it('should the path', () => {
    expect(baseRouter.getURL()).to.be.eql('/');
  });


  it('should return a same instance', () => {
    expect(baseRouter).to.not.be.undefined;
    expect(baseRouter)
      .to.be.an.instanceof(BaseRouter)
      .and.to.be.equal(BaseRouter.getInstance());
    expect(baseRouter).to.be.equal(BaseRouter.getInstance());
  });


  it('should get config on context', () => {
    const ctx = Object.assign(
      {state: {}},
      httpMocks.createRequest({
        method: 'GET',
        url: '/mocky',
      }),
      httpMocks.createResponse()
    );
    BaseRouter.checkMiddleware(ctx, () => {
      expect(ctx.state.data).to.be.a('object');
      expect(ctx.state.data).to.have.any.keys('api');
      expect(ctx.state.data.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
    });
  });

  describe('Call the server', () => {
    afterEach((done) => {
      openedServer.close();
      done();
    });

    beforeEach((done) => {
      server.initRouters(baseRouter.init());
      server.init().then(() => {
        openedServer = server.getApp().listen();
      }).done(done);
    });


    it('should send the geckoBoard API', (done) => {
      Supertest(openedServer)
        .get('/zen')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object')
            .and.to.have.any.keys('api');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
        })
        .end(done);
      ;
    });

    it('should get a good joke', (done) => {
      Supertest(openedServer)
        .get('/zen')
        .expect(200)
        .expect(({body}) => {
          console.log(body);
          expect(body).to.contains.keys('api', 'joke');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
          expect(body.joke).to.be.a('string');
        })
        .end(done);
      ;
    });
  });
});

