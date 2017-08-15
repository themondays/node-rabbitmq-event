var RabbitmqEvent = require('../index.js');

exports.main = function(test) {
  var e = new RabbitmqEvent({
    host: 'localhost',
    port: 5672,
    login: 'guest',
    password: 'guest',
    connectionTimeout: 10000,
    authMechanism: 'AMQPLAIN',
    noDelay: true,
    ssl: {
      enabled : false
    }
  }, 'test', ['main']);
  e.on('ready', function() {
      e.on('main:hello', function(response) {
      	// console.log(response);
        test.deepEqual(response, {'Hello': 'World'});
        e.quit();
        test.done();
    });
    setTimeout(function(){
      e.pub('main:hello', {'Hello': 'World'}, true);
    },500);
  });
};
