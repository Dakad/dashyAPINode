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
      const dte = '2015-12-17';
      expect(Util.convertDate(dte))
        .to.be.a('string')
        .and.to.be.equal('2015-12-17')
      expect(Util.convertDate(new Date(dte)))
        .to.be.a('string')
        .and.to.be.equal('2015-12-17')
    });
    it('shoud return the current date', () => {
      const dte = new Date();
      const res = dte.toISOString().substring(0, 10);
      expect(Util.convertDate())
        .to.be.a('string')
        .and.to.be.equal(res)
    });
  });

  describe('formatMoney', () => {
    const inputs = [1, 12, 123, 1234, 12345, 123456, 1234567, 12345.67];
    const outputs = ['€ 1.00', '€ 12.00', '€ 123.00', '€ 1 234.00', '€ 12 345.00', '€ 123 456.00', '€ 1 234 567.00', '€ 12 345.67']
    const outputs2 = ['€ 1.00', '€ 12.00', '€ 123.00', '€ 1,234.00', '€ 12,345.00', '€ 123,456.00', '€ 1,234,567.00', '€ 12,345.67']
    const outputs3 = ['€ 1,00', '€ 12,00', '€ 123,00', '€ 1 234,00', '€ 12 345,00', '€ 123 456,00', '€ 1 234 567,00', '€ 12 345,67']


    it('should format the number into currency with no delimeter', () => {
      let money;
      inputs.forEach((num,i)=> {
        money = Util.toMoneyFormat(num);
        expect(money.startsWith('€'),`1:${i} - Out : ${money}`).to.be.true;
        expect(money,`1:${i} - Out = ${money}`).to.be.eq(outputs[i]);

        money = Util.toMoneyFormat(num,',');
        expect(money.startsWith('€'),`2:${i} - Out : ${money}`).to.be.true;
        expect(money,`2:${i} - Out = ${money}`).to.be.eq(outputs2[i]);

        money = Util.toMoneyFormat(num,' ', ',');
        expect(money.startsWith('€'),`2:${i} - Out : ${money}`).to.be.true;
        expect(money,`2:${i} - Out = ${money}`).to.be.eq(outputs3[i]);
      });
    });
  });

  describe('hashCode', () =>{

    it('should return 0 on emtpy', () => {
      expect(Util.hashCode(undefined)).to.be.equals(0);
      expect(Util.hashCode()).to.be.equals(0);
      expect(Util.hashCode([])).to.be.equals(0);
      expect(Util.hashCode({})).to.be.equals(0);
      expect(Util.hashCode('')).to.be.equals(0);
    });


    it('should return the same hashcode multicall', () => {
      for (let nb in [1,2,3,4,5]) {
        expect(Util.hashCode('undefined')).to.be.equals(-1038130864);
        expect(Util.hashCode('a')).to.be.equals(97);
        expect(Util.hashCode('azerty')).to.be.equals(-1402147925);
      }
    });


    it('should return a hashCode on non string', () => {
      for (var nb in [1,2,3,4,5]) {
        expect(Util.hashCode({})).to.be.equals(Util.hashCode({}));
        expect(Util.hashCode('{}')).to.be.equals(Util.hashCode('{}'));
        expect(Util.hashCode({
          a:1, b : '2', c: 3,
          d : ['a','b','test']
        })).to.be.equals(Util.hashCode({
          a:1, b : '2', c: 3,
          d : ['a','b','test']
        }));
        expect(Util.hashCode(['a','b','test']))
          .to.be.equals(Util.hashCode(['a','b','test']));
      }
    });
  });

  // describe('convertArrayToObject', () =>{
  //   it('should return empty Object', () => {
  //     const obj = Util.convertArrayToObject();
  //     expect(obj).to.not.be.undefined.and.null;
  //     expect(obj).to.be.empty;
  //   });

  // });

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
