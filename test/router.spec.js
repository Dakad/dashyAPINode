/**
 * Test Unit for the Router component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies
// Packages
const {expect} = require('chai');
const sinon = require('sinon');


// Built-in

// Mine
const Router = require('../src/components/router');
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
    const spyHandler = sinon.spy(goodRouter,'handler');
    goodRouter.init();
    expect(spyHandler.called).to.be.true;
  });

  it('should on init(), call initPushser & handlerPusher()', ()=>{
    const spyInit = sinon.spy(goodRouter,'initPusher');
    const spyHandler = sinon.spy(goodRouter,'handlerPusher');
    const clock = sinon.useFakeTimers();

    goodRouter.init();
    expect(spyInit.called).to.be.true;
    expect(spyHandler.called).to.be.true;

    // Avance the clock to launch the push function
    clock.tick(Router.PUSH_TIME_OUT);

    //TODO Add unit test on the listPuhser.forEach setInterval

    spyHandler.restore();
    clock.restore();
  });

});
