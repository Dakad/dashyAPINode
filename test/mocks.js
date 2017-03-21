/**
 * @overview  Used as Factory to mock object;
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const Config = require('config');
// const httpMocks = require('node-mocks-http');
// const request = require('superagent');
// const sinon = require('sinon');


// Built-in 

// Mine
// const Util = require('../src/components/util');
const Router = require('../src/components/router');
const Feeder = require('../src/components/feeder');

const PipeDriveFeeder = require('../src/pipedrive/pipedrive-feed')


// -------------------------------------------------------------------
// Properties




class BadMockRouter extends Router {
  constructor(url) {
    super(url);
  }
}

class MockRouter extends Router {
  constructor(url) {
    super(url);
  }
  handler() {
    return "Handler implemented, So we good !";
  }
}


class MockFeeder extends Feeder {
    constructor(){
      super();
    }
}




class MockPipeFeed extends PipeDriveFeeder {
  
  getPipeline(req, res, next) {

    next();
  }

}





// -------------------------------------------------------------------
// Exports

module.exports = {
  'getBadRouter' : (...args) => new BadMockRouter(...args), 
  'getRouter' : (...args) => new MockRouter(...args), 
  'getFeeder' : (...args) => new MockFeeder(...args), 
  'getPipeFeed' : (...args) => new MockPipeFeed(...args), 


};
