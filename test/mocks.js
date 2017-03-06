/**
 * @overview 
 */


// -------------------------------------------------------------------
// Dependencies

// Packages
// const Config = require('config');
// const httpMocks = require('node-mocks-http');

// Built-in 

// Mine
const Util = require('../src/components/util');
const Router = require('../src/components/router');
const Feeder = require('../src/components/feeder');

const PipeDriveFeeder = require('../src/pipedrive/pipedrive-feed')




class MockUtil extends Util {
  /**
   *  
   * @extends ../src/components/util#requestPipeDriveFor
   * @override 
   * @memberof MockUtil
   */
  static requestPipeDriveFor(destination, query = {}) {
    return new Promise((resolve, reject) => {
      if (!destination) {
        return reject(new Error('Missing the destination to call PipeDrive'));
      }
      if (Util.isEmptyOrNull(query) || !query.api_token) {
        return reject(new Error('Missing the query : {apiToken}'));
      }
      if (destination[0] !== '/') {
        destination = '/' + destination;
      }
      // Just wait 2 sec to do your thing.
      const fct = setTimeout(() => {
        if (query.api_token !== 'PIPEDRIVE_API_TOKEN') {
          reject(new Error('Unauthorized - Unknown apiToken'));
        }
        else if (query.pipeline !== 123) {
          reject(new Error('Pipeline not found'));
        } else {
          resolve({
            data: 'Too much data, i\'drowning onto them !',
            a: 0,
            b: 1,
            c: 2
          });
        }

        clearTimeout(fct);
      }, 2000);
    });
  }
}


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
  
}




class MockPipeFeed extends PipeDriveFeeder {
  getPipeline(req, res, next) {

    next();
  }

}





// -------------------------------------------------------------------
// Exports

module.exports = {
  MockUtil,
  BadMockRouter,MockRouter,
  MockFeeder, MockPipeFeed

};
