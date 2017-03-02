/**
 * Test Unit for the Router component. 
 * 
 */

// -------------------------------------------------------------------
// Dependencies
// Packages
const expect = require('chai').expect;


// Built-in

// Mine
const Router = require('../src/components/router');


class MockRouter extends Router {
  constructor(url) {
    super(url);
  }

  handler() {

  }

}

describe('Component : Router', () => {
  let myRouter;
  beforeEach(() => myRouter = new MockRouter('/test/mocky'));

  it('should throws TypeError', () => {
    expect(myRouter.handler).to.throw(new TypeError());
  });

  it('getURL', () => {
    const url = myRouter.getURL();
    expect(url).to.be.a('string')
      .and.to.be.equal('/test/mocky');
  });
});
