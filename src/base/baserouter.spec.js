'use strict';
/* eslint-disable new-cap */
/**
 * @overview Unit Test for BaseRouter
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
<<<<<<< HEAD
const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
=======
const {expect} = require('chai');
>>>>>>> remotes/origin/koa
const Supertest = require('supertest');

// Built-in

// Mine
const Server = require('../components/server');
const BaseRouter = require('./baserouter');
<<<<<<< HEAD

// -------------------------------------------------------------------
// Properties
const server = new Server(0);
let baseRouter;
let openedServer;


// -------------------------------------------------------------------
// Test


describe('Base : BaseRouter', () => {
  beforeEach(() => baseRouter = BaseRouter.getInstance());
=======
// -------------------------------------------------------------------
// Properties
const server = new Server(0);

let baseRouter;
let openedServer;
let ctx;
let next;
// -------------------------------------------------------------------
// Test Units


describe('Base : BaseRouter', () => {
  beforeEach(() => {
    baseRouter = BaseRouter.getInstance();
    ctx = {body: {}, state: {}, status: 404};
  });
>>>>>>> remotes/origin/koa

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

<<<<<<< HEAD

  describe('should get config on checkMiddleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'GET',
        url: '/mocky',
      });
      res = httpMocks.createResponse();
      res.locals = {};

      next = () => {
        expect(res.locals).to.be.a('object');
        expect(res.locals).to.have.any.keys('data');
        expect(res.locals.data).to.have.any.keys('api');
        expect(res.locals.data.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
      };
    });

    it('should call nextMiddleware', () => {
      const spyNext = sinon.spy();
      BaseRouter.checkMiddleware(req, res, spyNext);
      expect(spyNext.called).to.be.true;
    });

    it('should set config on locals', () => {
      BaseRouter.checkMiddleware(req, res, next);
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
        .expect(({
          body,
        }) => {
          expect(body).to.be.a('object');
          expect(body).to.have.any.keys('api');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
        })
        .end(done); ;
    });

    it('should get a good joke', (done) => {
      Supertest(openedServer)
        .get('/zen')
        .expect(200)
        .expect(({
          body,
        }) => {
          expect(body).to.have.any.keys('api', 'joke');
          expect(body.api).to.be.eql('GECKOBOARD_WIDGET_API_KEY');
          expect(body.joke).to.be.a('string');
        })
        .end(done); ;
    });
  });
});
=======
  describe('Middlewares', () => {
    it('should get config on context', () => {
      next = () => {
          expect(ctx.state).to.contains.keys('config');
          expect(ctx.state.config).to.be.a('object').and.empty;
      };
      BaseRouter.checkMiddleware(ctx, next);
    });
  });


  describe('Call the routes with the server', () => {
    describe('with the server', () => {
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
});

>>>>>>> remotes/origin/koa
