import assert from 'assert';
import should from 'should';
import  Promise from 'bluebird';
import 'mochawait';

var Publisher = require('../src/').Publisher;

describe('Publisher', function() {
  'use strict';
  this.timeout(15e3);
  const log = require('logfilename')(__filename, {
    console: {
      level: 'debug'
    }
  });

  log.debug('');

  const publisherOptions = {
    exchange: 'user'
  };
  describe('Invalid Constructor', function() {
    it('no options', done => {
      (function(){
        new Publisher();
      }).should.throw();
      done();
    });
    it('no exchange options', done => {
      (function(){
        new Publisher({});
      }).should.throw();
      done();
    });
  });
  describe('StartStop', function() {
    it('should start and stop the publisher', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.start();
      await Promise.delay(1e3);
      await publisher.stop();
    });
    it('should stop the publisher without start', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.stop();
    });
    it('should start and publish', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.start();
      await publisher.publish('myRoutingKey', 'Ciao');
    });
    it('publish without start', async () => {
      let publisher = new Publisher(publisherOptions);
      try {
          await publisher.publish('myRoutingKey', 'Ciao');
      } catch(error){
          assert.equal(error.code, 503);
      }
    });
  });

});
