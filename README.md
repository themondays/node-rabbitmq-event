# node-rabbitmq-event
A simple distributed AMQP multi-channel event emitter.
## Synopsis
rabbitmq-event simple and lightweight evet emitter which supports multiple queues.
## Install
```
npm install rabbitmq-event
```
## Usage
```
  const RabbitmqEvent = require('rabbitmq-event');
  var e = new RabbitmqEvent({
    host: 'localhost',
    connectionTimeout: 10000,
    noDelay: true,
    ssl: {
      enabled : false
    }
  }, 'service.exchange', ['service', 'state']);
  e.on('ready', function() {
    e.on('service:test', function(data) {
      console.log(data);
    });
    e.on('service:shutdown', function(data) {
      e.quit();
    });
    e.pub('state:date', {
      date: new Date()
    }, true);
  });
```
## Test
```
npm test
```
## API
### new RabbitmqEvent(connection, exchangeName, [queue1, queue2])
Initialise RabbitmqEvent module
#### Arguments
- `connection` - connection settings object
- `exchangeName` - name of an exchange
- `queues` - array of AMQP queues
#### Connection Example
```
var connection = {
  host: 'localhost',
  connectionTimeout: 10000,
  noDelay: true,
  ssl: {
    enabled : false
  }
}
```
### RabbitmqEvent.pub(eventName, payload, stringPayload)
Publish event
#### Arguments
- `eventName` - event name in following format - `queue`:`event`
- `payload` - (optional) data will be delivered to subscribers

### RabbitmqEvent.on(eventName, function(payload))
Subscribe a new event.
#### Arguments
- `eventName` - event name in following format - `queue`:`event`
- `payload` - (optional) incoming payload
### RabbitmqEvent.quit()
Disconnect pub/sub sessions

## PS
Additional thanks to @egorfine, initially this module born from redis-emitter a while ago.

## Licemse
MIT
