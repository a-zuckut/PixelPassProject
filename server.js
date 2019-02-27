var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// your express configuration here
var server = http.createServer(app);
server.listen(8080);

// help from: https://zellwk.com/blog/crud-express-mongodb/

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server Started');
  console.log('Example app listening at http://' + 'localhost' + ':' + port);
}

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://testing:dbpasswordtest@cluster0-shard-00-00-afdih.mongodb.net:27017,cluster0-shard-00-01-afdih.mongodb.net:27017,cluster0-shard-00-02-afdih.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
var db;

var name = "testing1";
var collectionName = "test";

MongoClient.connect(url, function(err, client) {
  console.log("Connected to MongoDB Database");
  db = client.db(name);
});

app.use(bodyParser.json()); // for parsing application/json

app.post("/test.html/savegrid", (req, res) => {
    // console.log(req.body);
    var collection = db.collection(collectionName);
    collection.save(req.body, (err, result) => {
      if (err) return console.log(err);
      console.log("saved successfully to database");
      console.log("\t" + req.body.name);
    });
});

app.get("/test.html/get", (req, res) => {
  console.log("Getting database data")
  var find = req.query.test
  // console.log(find)
  var cursor = db.collection(collectionName).find({"name": find}).next(function(err,items){
    // console.log(items)
    res.json(items)
  })
});

app.use(express.static('public'));