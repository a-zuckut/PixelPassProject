var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 8080;

// your express configuration here
var server = http.createServer(app);
server.listen(port, listen);

// help from: https://zellwk.com/blog/crud-express-mongodb/

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server Started');
  console.log('Example app listening at http://' + 'localhost' + ':' + port);
}

// DATABASE SETUP INFORMATION
var MongoClient = require('mongodb').MongoClient;
// The url that allows access to database
var url = 'mongodb://testing:dbpasswordtest@cluster0-shard-00-00-afdih.mongodb.net:27017,cluster0-shard-00-01-afdih.mongodb.net:27017,cluster0-shard-00-02-afdih.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
var db;
// Cluster information for MongoDB
var database_name = "database";
var collection_name = "project";

MongoClient.connect(url, function(err, client) {
  console.log("Connected to MongoDB Database");
  db = client.db(database_name);
});

app.use(bodyParser.json()); // for parsing application/json

app.get('/', function (req, res) {
  res.redirect('/game.html');
});

app.post("/game.html/savegrid", (req, res) => {
    console.log("Save Grid Post Request");
    var collection = db.collection(collection_name);
    if (req.body.new) {
      console.log("Saving New Item")
      collection.save(req.body.data, (err, result) => {
        if (err) return console.log(err);
        console.log("saved successfully to database");
        console.log("saveid: " + req.body.data.name);
      });
      res.end();
    } else {
      console.log("update userid: " + req.body.user + ":" + req.body.userid)
      var myquery = {"name": req.body.data.name};
      var index = "data.grids." + req.body.userid;
      var newvalues = {$set: { [index]: req.body.data.data.grids[req.body.userid]} };
      collection.updateOne(myquery, newvalues, function(err, result) {
        if (err) return console.log(err);
        console.log("Updating saveid: " + req.body.data.name);
      });
      res.end();
    }
});

app.get("/game.html/get", (req, res) => {
  console.log("Getting database data")
  var find = req.query.project
  var cursor = db.collection(collection_name).find({"name": find}).next(function(err,items){
    res.json(items)
  })
});

app.get("/getusers", (req, res) => {
  // get users as list from database
  list = [];
  db.collection(collection_name).find().forEach((data) => {
    for (var i = 0; i < data.data.grids.length; i++) {
      if (data.data.grids[i].user != null)
        list.push(data.data.grids[i].user)
    }
  }).then(function(count) {
    console.log(list)
    res.json(list)
  });
});

app.use(express.static('public'));
