/**
 * Test Unit the util modules.
 *
 */

// -------------------------------------------------------------------
// Modules dependencies

// npm
const expect = require('chai').expect;


// Built-in

// mine
const Util = require('../../src/modules/Util');


describe('Module : Util', () => {
  describe('isEmptyOrNull', () => {
    it('should return true', (done) => {
      expect(Util.isEmptyOrNull()).to.be.true;
      expect(Util.isEmptyOrNull(undefined)).to.be.true;
      expect(Util.isEmptyOrNull(null)).to.be.true;
      expect(Util.isEmptyOrNull({})).to.be.true;
      expect(Util.isEmptyOrNull([])).to.be.true;

      done();
    });

    it('should return false', () => {
      expect(Util.isEmptyOrNull({ a: 1 })).to.be.false;
      expect(Util.isEmptyOrNull([1])).to.be.false;
      expect(Util.isEmptyOrNull({ a: 1, b: 2 })).to.be.false;
      expect(Util.isEmptyOrNull([1, 2, 3])).to.be.false;
      
    });
  });
});
