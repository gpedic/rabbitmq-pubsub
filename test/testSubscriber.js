var assert = require('assert');
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug');
var Subscriber = require('../lib/subscriber');
var Publisher = require('../lib/publisher');

describe('PublisherSubscriber', function() {
  'use strict';
  this.timeout(15e3);
  var logOptions = {
    console: {
      level: 'debug'
    }
  };
  var publisher;
  var subscriber;
  var mqOptions = {
    exchange: 'user.new',
    queueName: 'user.new'
  };

  describe('StartStop', function() {
    it('should start and stop the publisher', function(done) {
      publisher = new Publisher({
        exchange: 'user.new'
      });
      publisher.start().delay(1e3).then(publisher.stop).then(done,
        done);
    });

    it('should start, purge the queue and stop the subscriber',
      function(done) {
        subscriber = new Subscriber(mqOptions);
        subscriber.start()
          .delay(1e3)
          .then(subscriber.purgeQueue)
          .then(subscriber.stop)
          .then(done, done);
      });

    it('should stop the subscriber without start', function(done) {
      subscriber = new Subscriber(mqOptions);
      subscriber.stop().then(done, done);
    });

    it('should start and stop the publisher and subscriber', function(
      done) {
      publisher = new Publisher({
        exchange: 'user.new'
      });
      subscriber = new Subscriber(mqOptions);
      Promise.all(
          [
            publisher.start(),
            subscriber.start()
          ])
        .delay(1e3)
        .then(function() {
          return Promise.all(
            [
              publisher.stop(),
              subscriber.stop()
            ]);
        })
        .then(function() {

        })
        .then(done, done);
    });
  });

  describe('Subscriber', function() {
    before(function(done) {
      debug('publisher.start()');
      publisher = new Publisher({
        exchange: 'user.new'
      });
      publisher.start().then(done,
        done);
    });

    after(function(done) {
      debug('publisher.stop()');
      publisher.stop().then(done, done);
    });

    it('should receive the published message', function(done) {
      debug('should start the mq');

      function onIncomingMessage(message) {
        debug('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        subscriber.ack(message);
        done();
      }
      var subscriber = new Subscriber(mqOptions);
      subscriber.getEventEmitter().once('message',
        onIncomingMessage);

      subscriber.start()
        .then(function() {
          debug('started');
          publisher.publish('', 'Ciao');
        })
        .catch(done);
    });
    it('should send and receive 10 messages', function(done) {
      debug('should start the mq');

      function onIncomingMessage(message) {
        debug('onIncomingMessage ', message.fields);
        subscriber.ack(message);

        numMessage++;
        debug('onIncomingMessage ', numMessage);
        if (numMessage >= numMessageToSend) {
          subscriber.getEventEmitter().removeListener('message',
            onIncomingMessage);
          done();
        }
      }

      var numMessage = 0;
      var numMessageToSend = 10;

      var subscriber = new Subscriber(mqOptions, logOptions);
      subscriber.getEventEmitter().on('message',
        onIncomingMessage);

      subscriber.start()
        .then(function() {
          debug('started');
          _.times(numMessageToSend, function(n) {
            publisher.publish('', 'Ciao ' + n);
          });

        })
        .catch(done);


    });
  });
});
