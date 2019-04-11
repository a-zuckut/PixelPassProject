var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');

// Initializing Express Server
var app = express();
var port = process.env.PORT || 8080; // env port for heroku

// Start server
var server = http.createServer(app);
server.listen(port, listen);

// This call back gives confirmation server started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server Started');
  console.log('Example app listening at http://' + 'localhost' + ':' + port);
}

// setup MongoDB
var MongoClient = require('mongodb').MongoClient;
// The url that allows access to database
var url = 'mongodb://testing:dbpasswordtest@cluster0-shard-00-00-afdih.mongodb.net:27017,cluster0-shard-00-01-afdih.mongodb.net:27017,cluster0-shard-00-02-afdih.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
var db;
// Cluster information for database (in future dependency injection could make more secure)
var database_name = "database";
var collection_name = "project";

// Initializing MongoDB
MongoClient.connect(url, function(err, client) {
  console.log("Connected to MongoDB Database");
  db = client.db(database_name);
});

app.use(bodyParser.json()); // for parsing application/json

// Redirecting to index.html as default page
app.get('/', function (req, res) {
  res.redirect('/index.html');
});

// API #1, savegrid will save to database and either update or save new item
app.post("/game.html/savegrid", (req, res) => {
    console.log("Save Grid Post Request");
    var collection = db.collection(collection_name);
    if (req.body.new) {
      console.log("Saving New Item.");
      collection.save(req.body.data, (err, result) => {
        if (err) return console.log(err);
        console.log("New Grid ID: " + req.body.data.name);
      });
      res.end();
    } else {
      console.log("Update User ID: " + req.body.user + ";" + req.body.userid);
      var myquery = {"name": req.body.data.name};
      var index = "data.grids." + req.body.userid;
      var newvalues = {$set: { [index]: req.body.data.data.grids[req.body.userid]} };
      collection.updateOne(myquery, newvalues, function(err, result) {
        if (err) return console.log(err);
        console.log("Updating Grid ID: " + req.body.data.name);
      });
      res.end();
    }
});

// API #2, get will find a grid based on a Save ID
app.get("/game.html/get", (req, res) => {
  console.log("Getting database data")
  var find = req.query.project // Save ID
  var cursor = db.collection(collection_name).find({"name": find}).next(function(err,items){
    res.json(items); // return via json
  })
});

// API #3, get all users and return these through a list
app.get("/getusers", (req, res) => {
  // get users as list from database
  list = []; // return value
  db.collection(collection_name).find().forEach((data) => {
    for (var i = 0; i < data.data.grids.length; i++) {
      // go through all grids and if an user exists for a grid, add it to the list
      if (data.data.grids[i].user != null)
        list.push(data.data.grids[i].user);
    }
  }).then(function(count) {
    res.json(list);
  });
});

app.use(express.static('public'));
