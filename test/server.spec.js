'use script';
/* eslint-disable new-cap */
/**
 * @overview Unit Test for Server
 *
 */


// -------------------------------------------------------------------
// Dependencies

// Package npm
const expect = require('chai').expect;
// const sinon = require('sinon');
// const Supertest = require('supertest');

// Built-in

// Mine
const Server = require('../src/components/server');
// const TestMock = require('./mocks');

// -------------------------------------------------------------------
// Properties


// -------------------------------------------------------------------
// Test

describe('Component : Server', () => {
  let server;

  

  it('should create an app for the server', () => {
    server = new Server(0);
    expect(server.getApp()).to.not.be.null;
  });

  it('should create an app on the defined port', () => {
    
  });

});
