'use strict';
/* eslint-disable new-cap */
/**
 * @overview Unit Test for BaseRouter
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const expect = require('chai').expect;
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
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/mocky',
    });

    const res = httpMocks.createResponse();
    res.locals = {};

    BaseRouter.checkMiddleware(req, res, () => {
      expect(res.locals).to.be.a('object');
      expect(res.locals).to.have.any.keys('data');
      expect(res.locals.data).to.have.any.keys('api');
      expect(res.locals.data.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
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
        .get('/')
        .expect(200)
        .expect(({body}) => {
          expect(body).to.be.a('object');
          expect(body).to.have.any.keys('api');
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
          expect(body).to.have.any.keys('api', 'joke');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
          expect(body.joke).to.be.a('string');
        })
        .end(done);
      ;
    });
  });
});

