/**
 * Test Unit the util modules.
 *
 */

// -------------------------------------------------------------------
//  Dependencies

// Packages
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const request = require('superagent');
// const mockRequest = require('superagent-mock');

// Built-ins

// Mine
const Util = require('../src/components/util');


// -------------------------------------------------------------------
//  Properties
// const superagentMock = mockRequest(request, mockReqConf);

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

  describe('convertDate', () => {
    it('shoud return 2015-12-17', () => {
      const dte = new Date('2015-12-17');
      expect(Util.convertDate(dte))
        .to.be.a('string')
        .and.to.be.equal('2015-12-17')
    });
    it('shoud return the current date', () => {
      const dte = new Date();
      const res = dte.toISOString().substring(0,10);
      expect(Util.convertDate())
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

});
