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
const Pusher = require('../src/components/pusher');

// -------------------------------------------------------------------
// Properties




class BadMockRouter extends Router {
  constructor(url) {
    super(null,url);
  }
}

class MockRouter extends Router {
  constructor(url) {
    super(null,url);
  }
  handler() {
    return "Handler implemented, So we good !";
  }

  handlerPusher(){
    this.listPushers_.push(new Pusher('widgetId', Promise.resolve('widget1')));
    this.listPushers_.push(new Pusher('widgetId2', Promise.resolve('widget2')));
    // return "Handler Pusher implemented, So we good !";
  }
}


class MockFeeder extends Feeder {
    constructor(){
      super();
    }
}








// -------------------------------------------------------------------
// Exports

module.exports = {
  'getBadRouter' : (...args) => new BadMockRouter(...args), 
  'getRouter' : (...args) => new MockRouter(...args), 
  'getFeeder' : (...args) => new MockFeeder(...args), 
};
