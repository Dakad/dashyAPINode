/**
 * Test Unit for the Router component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
const sinon = require('sinon');


// Built-in

// Mine
// const Router = require('../src/components/router');
const TestUtil = require('./mocks');


// -------------------------------------------------------------------
// Properties




describe('Component : Router', () => {
  let badRouter, goodRouter;
  beforeEach(() => {
    badRouter = TestUtil.getBadRouter('/mocky/router/bad');
    goodRouter = TestUtil.getRouter('/mocky/router/good');
  });

  it('should throws TypeError', () => {
    expect(badRouter.handler).to.throw(TypeError);
  });

  it('should not throws TypeError', () => {
    expect(goodRouter.handler).to.not.throw(TypeError);
  });

  it('getURL', () => {
    expect(badRouter.getURL()).to.be.a('string').and.to.be.equal('/mocky/router/bad');
    expect(goodRouter.getURL()).to.be.a('string').and.to.be.equal('/mocky/router/good');
  });

  it('should on init(), call handler()', () => {
    const spyHandler = sinon.spy(goodRouter.handler);
    goodRouter.init();
    expect(spyHandler.called).to.be.true;
  });

  it('should on init() return {url,routes}', () => {
    const initedRouter = goodRouter.init();
    expect(initedRouter).to.not.be.null;
    expect(initedRouter).to.have.all.keys('url','routes');
    expect(initedRouter.url).to.be.equal(goodRouter.getURL());
  });



});
