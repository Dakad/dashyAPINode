/**
 * @overview 
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const httpMocks = require('node-mocks-http');

// Built-in 

// Mine
const Router = require('../src/components/router');
const Util = require('../src/components/util');


class MockUtil extends Util{
  
}


class BadMockRouter extends Router {
  constructor(url) {
    super(url);
  }
}

class MockRouter extends Router{
  constructor(url){
    super(url);
  }
  handler(){
    return "Handler implemented, So we good !";
  }
}


// -------------------------------------------------------------------
// Exports

module.exports = {
  MockUtil,
  BadMockRouter, MockRouter

}
