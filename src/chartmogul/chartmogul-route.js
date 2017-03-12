/**
 * @overview SubRouter to handle the all path related to /chartmogul
 *
 * @module {Router} router/chartmogul
 * @requires router
 * @requires chartmogul-feed
 */


// -------------------------------------------------------------------
// Dependencies

// Packages

// Built-in

// Mine
// const Util = require('../components/util');
const Router = require('../components/router');

// -------------------------------------------------------------------
// Properties

class ChartMogulRouter extends Router {

  constructor(feed) {
    super('/chartmogul', feed);
  }


  public checkParams(req,res,next){

    next();
  }


  public init(){
    
  }

};
