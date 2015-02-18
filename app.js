var express = require("express");
var fs = require('fs');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')

var app = express();
app.set('port', 3000);
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
  this.recieveMsg = function(message) {
    var msg = JSON.stringify(message);
    while (clients.length > 0) {
      var client = clients.pop();
      client.end(msg);
    }
  }

  this.addClient = function(req,res){
    clients.push(res);
  }

  // This interval will clean up all the clients every minute to avoid timeouts
  setInterval(function() {
    while (clients.length > 0) {
      var client = clients.pop();
      client.writeHeader(204);
      client.end();
    }
  }, 60000);
}

var clientPool = new ClientPool();

// Poll endpoint
app.get('/poll/*', function(req, res) {
  clientPool.addClient(req, res);
});

// Msg endpoint
app.post('/msg', function(req, res) {
  clientPool.recieveMsg(req.body);
  res.end();
});


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
