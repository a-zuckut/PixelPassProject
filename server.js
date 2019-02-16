var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var app = express();

// your express configuration here
var server = http.createServer(app);
server.listen(8080);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server Started');
  console.log('Example app listening at http://' + host + ':' + port);
}

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://testing:dbpasswordtest@cluster0-shard-00-00-afdih.mongodb.net:27017,cluster0-shard-00-01-afdih.mongodb.net:27017,cluster0-shard-00-02-afdih.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
var db;

MongoClient.connect(url, function(err, db) {
  console.log("Connected");
  db = db.db('testing1');
});

app.post("/test.html/savegrid", (req, res) => {
    console.log(req);
});

app.use(express.static('public'));
