var express = require("express");
var fs = require('fs');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')
var broadcastHub = require('broadcast-hub');

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
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use(bodyParser.json());

// Serve up our static resources
app.get('/', function(req, res) {
  fs.readFile('./public/index.html', function(err, data) {
    res.end(data);
  });
});

var publisher = redisFactory();

publisher.on("error", function(err) {
  console.error('There was an error with the redis client ' + err);
});


// Msg endpoint
app.post('/msg', function(req, res) {
  if (req.body && req.body.message) {
    publisher.publish("chatter", JSON.stringify(req.body));
  }
  res.end();
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

broadcastHub.listen(server);
