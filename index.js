var util = require('util'),
  events = require('events'),
  amqp = require('amqp');

function RabbitmqEvent(connection, exchangeName, queueList) {
  "use strict";
  events.EventEmitter.call(this);

  var self = this;

  self.exchangeName = exchangeName;

  self._connectedCount=0;

  if (!queueList || queueList.length === 0) {
    throw new Error("No queues specified to RabbitmqEvent");
  }

  if (!connection.host) {
    throw new Error("No hostname specified to RabbitmqEvent");
  }

  this.queueList = queueList;

  // Publish
  this.pubRabbit = amqp.createConnection(connection);
  this.pubRabbit.on('error', function(err){
    console.log(err);
  });
  this.pubRabbit.on('ready', function(conn){
    self._connectedCount++;
    self._exchange();
    if (self._connectedCount == 2) {
      self.emit('ready');
    }
  });
  this.pubRabbit.on('end', function() {self._connectedCount--; });

  // Subscribe
  this.subRabbit = amqp.createConnection(connection);
  this.subRabbit.on('error', function(err){
    console.log(err);
  });
  this.subRabbit.on('ready', function(conn) {
    self._connectedCount++;
    self._subscribe();
    if (self._connectedCount == 2) {
      self.emit('ready');
    }
  });

  this.subRabbit.on('message', this._onMessage.bind(this));
  this.subRabbit.on('end', function() {self._connectedCount--; });

}

util.inherits(RabbitmqEvent, events.EventEmitter);

RabbitmqEvent.prototype._exchange = function() {
   this.exchange = this.pubRabbit.exchange(this.exchangeName, {type: 'topic'});
};

RabbitmqEvent.prototype._subscribe = function() {
  var self = this;
  this.queueList.forEach(function(queueName) {
    self.subRabbit.queue(queueName, function(queue){
      queue.bind(self.exchangeName, queueName);
      queue.subscribe(function(message, headers, payload){
        self.subRabbit.emit('message', message, headers, payload);
      });
    });
  });
};

RabbitmqEvent.prototype._onMessage = function(message, headers, payload) {
  var eventName = null, channelName = null;

  channelName = payload.routingKey;
  if (headers.event !== undefined) {
    eventName = headers.event;
  } else {
    eventName = message;
  }

  try {
    eventName = channelName + ':' + eventName;
  } catch(e) {
  }
  if (eventName) {
    this.emit(eventName, message);
  }
};

RabbitmqEvent.prototype.pub = function(eventName, payload, stringPayload) {
  var task = eventName.split(':');

  if (task.length!=2) {
    console.log("eventName '%s' is incorrect", eventName);
    return false;
  }

  var options = {
    contentType: 'application/octet-stream',
    headers: {
      event: task[1],
      dataType: 'raw'
    }
  };
  
  if (stringPayload) {
    options.contentType = 'text/json';
    options.headers.dataType = 'string';
  }

  this.exchange.publish(task[0], payload, options);
};

RabbitmqEvent.prototype.quit = function() {
  this.subRabbit.disconnect();
  this.pubRabbit.disconnect();
};

module.exports = RabbitmqEvent;
