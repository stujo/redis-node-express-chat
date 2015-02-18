var express = require("express");
var fs = require('fs');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')

function redisFactory() {
  if (process.env.REDISTOGO_URL) {
    var rtg = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
  } else {
    var redis = require("redis").createClient();
  }
  return redis;
}

var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Serve up our static resources
app.get('/', function(req, res) {
  fs.readFile('./public/index.html', function(err, data) {
    res.end(data);
  });
});

function ClientPool() {
  var clients = [];

   function incomingMessage(message){
    if(message && message.message){
       publisher.publish("chatter", JSON.stringify(message));
     }
   }

  function broadcastMessage(message) {
    while (clients.length > 0) {
      var client = clients.pop();
      client.end(message);
    }
  }

  function addClient(req, res) {
    clients.push(res);
  }

  var subscriber = redisFactory();
  subscriber.on("error", function(err) {
    console.error('There was an error with the redis client ' + err);
  });

  subscriber.on('message', function(channel, msg) {
    if (channel === 'chatter') {
      broadcastMessage(msg);
    }
  });

  subscriber.subscribe('chatter');


  var publisher = redisFactory();

  publisher.on("error", function(err) {
    console.error('There was an error with the redis client ' + err);
  });

  // This interval will clean up all the clients every minute to avoid timeouts
  setInterval(function() {
    while (clients.length > 0) {
      var client = clients.pop();
      client.writeHeader(204);
      client.end();
    }
  }, 60000);

  return {
    addClient: addClient,
    incomingMessage: incomingMessage
  };
}

var clientPool = new ClientPool();

// Poll endpoint
app.get('/poll/*', function(req, res) {
  clientPool.addClient(req, res);
});

// Msg endpoint
app.post('/msg', function(req, res) {
  clientPool.incomingMessage(req.body);
  res.end();
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
