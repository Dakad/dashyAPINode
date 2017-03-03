/**
 * Test Unit for the Router component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;
const { BadMockRouter, MockRouter } = require('./mocks');

// Built-in

// Mine
// const Router = require('../src/components/router');


describe('Component : Router', () => {
  let badRouter, goodRouter;
  beforeEach(() => {
    badRouter = new BadMockRouter('/mocky/router/bad');
    goodRouter = new MockRouter('/mocky/router/good');
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



});
