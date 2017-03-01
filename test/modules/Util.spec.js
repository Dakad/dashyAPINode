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
    it('should return true', () => {
      const isEmpty = Util.isEmptyOrNull();
      expect(isEmpty).to.be.true;
    });
  });
});
