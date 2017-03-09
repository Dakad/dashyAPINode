/**
 * Test Unit the util modules.
 *
 */

// -------------------------------------------------------------------
//  Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const sinon = require('sinon');
const Config = require('config');
const request = require('superagent');
const mockRequest = require('superagent-mock');

// Built-ins

// Mine
const mockReqConf = require('./superagent-mock-config');
const Util = require('../src/components/util');


// -------------------------------------------------------------------
//  Properties
const superagentMock = mockRequest(request, mockReqConf);

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('Component : Util', () => {

  describe('isEmptyOrNull', () => {
    it('should return true', () => {
      expect(Util.isEmptyOrNull()).to.be.true;
      expect(Util.isEmptyOrNull(undefined)).to.be.true;
      expect(Util.isEmptyOrNull(null)).to.be.true;
      expect(Util.isEmptyOrNull({})).to.be.true;
      expect(Util.isEmptyOrNull([])).to.be.true;
    });

    it('should return false', () => {
      expect(Util.isEmptyOrNull({
        a: 1
      })).to.be.false;
      expect(Util.isEmptyOrNull([1])).to.be.false;
      expect(Util.isEmptyOrNull({
        a: 1,
        b: 2
      })).to.be.false;
      expect(Util.isEmptyOrNull([1, 2, 3])).to.be.false;
    });
  });

  describe('convertPipeDriveDate', () => {
    it('shoud return 2015-12-17', () => {
      const dte = new Date('2015-12-17');
      expect(Util.convertPipeDriveDate(dte))
        .to.be.a('string')
        .and.to.be.equal('2015-12-17')
    });
    it('shoud return the current date', () => {
      const dte = new Date();
      const res = dte.toISOString().substring(0,10);
      expect(Util.convertPipeDriveDate())
        .to.be.a('string')
        .and.to.be.equal(res)
    });
  });
  
  describe('checkParams', () => {
    it('should by default be valid', () => {
      const check = Util.checkParams({});

      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;
    });

    it('should be valid if contains non-exist params', () => {
      const check = Util.checkParams({
        begin: 'this_month',
        toto: 'azerty'
      });

      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;
    });

    it('should be valid for non-exist params', () => {
      const check = Util.checkParams({
        toto: 'azerty'
      });

      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;
    });

    it('should be valid for param ?begin', () => {
      const check = Util.checkParams({
        begin: 'this_month'
      });

      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must be valid').to.be.ok;
      expect(check.errMsg).to.be.null;
    });

    it('should not be valid for incorrect param ?begin', () => {
      const check = Util.checkParams({
        begin: 'today'
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must not be valid').to.not.be.ok;
      expect(check.errMsg).to.be.not.null;
      expect(check.errMsg).to.be.equals('The parameter \'begin\' is invalid - Got \'today\'');
    });

    it('should not be valid for incorrect param ?for', (done) => {
      let check = Util.checkParams({
        for: -1
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must not be valid').to.not.be.ok;
      expect(check.errMsg, 'Must contains a msg').to.not.be.null;
      expect(check.errMsg).to.be.equals('The parameter \'for\' is invalid - Got \'-1\'');

      check = Util.checkParams({
        for: 0
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must not be valid').to.not.be.ok;
      expect(check.errMsg, 'Must contains a msg').to.not.be.null;
      expect(check.errMsg).to.be.equals('The parameter \'for\' is invalid - Got \'0\'');

      check = Util.checkParams({
        for: 13
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must not be valid').to.not.be.ok;
      expect(check.errMsg, 'Must contains a msg').to.not.be.null;
      expect(check.errMsg).to.be.equals('The parameter \'for\' is invalid - Got \'13\'');

      done();
    });

    it('should be valid for param ?for', (done) => {
      let check = Util.checkParams({
        for: 1
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must be valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;

      check = Util.checkParams({
        for: 5
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must be valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;

      check = Util.checkParams({
        for: 12
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must be valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;

      check = Util.checkParams({
        for: '7'
      });
      expect(check).to.be.an('object');
      expect(check).to.have.all.keys('isValid', 'errMsg');
      expect(check.isValid, 'Must be valid').to.be.ok;
      expect(check.errMsg, 'Must null or empty').to.be.null;
      done();
    });
  });

  describe('requestPipeDriveFor', () => {
    const query = {
      api_token: 'PIPEDRIVE_API_TOKEN',
      pipeline: 123,
    }
    let req;

    let spySuperAgent;

    beforeEach(() => {
      spySuperAgent = sinon.spy(request,'get');
      
    });

    afterEach(() => spySuperAgent.restore());

    after(() => superagentMock.unset());
    
    it('should use request.get', (done) => {
      Util.requestPipeDriveFor('reqMe',query)
        .done((res) => {
          expect(spySuperAgent.called).to.be.true;
          done();
        },(err)=> done());
      
    });

    it('should return a Promise.rejected -  args:undefinied', (done) => {
      req = Util.requestPipeDriveFor();
      expect(req.catch).to.be.a('function');
      expect(req).to.be.rejected.notify(done);
    });

    it('should return a Promise.rejected - args[dest]:undefined', (done) => {
      req = Util.requestPipeDriveFor(null, query);
      expect(req.catch).to.be.a('function');
      expect(req).to.be.rejected.notify(done);
    });

    it('should return a Promise.rejected - args[dest]:pipe/deals', (done) => {
      req = Util.requestPipeDriveFor('/pipe/deals');
      expect(req).to.be.rejected.notify(done);
      expect(req.catch).to.be.a('function');
    });

    it('should return a Promise.fullfied - /pipeline', (done) => {
      req = Util.requestPipeDriveFor('/pipelines', query);
      expect(req).to.be.fulfilled
      expect(req.then).to.be.a('function');
      expect(req.catch).to.be.a('function');
      expect(req.then).to.be.a('function');
      req.done((data)=> {
        expect(data).to.equal(Config.request.pipedrive.pipelines);
        done();
      });
    });





  });
});
