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

// app.post("/test.html/savegrid", (req, res) => {
//     // console.log(req.body);
//     var collection = db.collection(collectionName);
//     collection.save(req.body, (err, result) => {
//       if (err) return console.log(err);
//       console.log("saved successfully to database");
//       console.log("\t" + req.body.name);
//     });
// });

app.get('/', function (req, res) {
  res.redirect('/FrontEnd.html');
});

app.post("/FrontEnd.html/savegrid", (req, res) => {
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
      var myquery = {"name": req.body.data.name};
      var newvalues = {$set: {"data": req.body.data.data} };
      collection.updateOne(myquery, newvalues, function(err, result) {
        if (err) return console.log(err);
        console.log("Updating saveid: " + req.body.data.name);
      });
      res.end();
    }
});

app.get("/FrontEnd.html/get", (req, res) => {
  console.log("Getting database data")
  var find = req.query.test
  var cursor = db.collection(collection_name).find({"name": find}).next(function(err,items){
    res.json(items)
  })
});

app.use(express.static('public'));
