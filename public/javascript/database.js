var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://testing:dbpasswordtest@cluster0-shard-00-00-afdih.mongodb.net:27017,cluster0-shard-00-01-afdih.mongodb.net:27017,cluster0-shard-00-02-afdih.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'

var db;

MongoClient.connect(url, function(err, db) {
  console.log("Connected");
  db = db.db('testing1');
});

function get(name) {
  db.collection('test').find().toArray(function(err, results) {
    console.log(results);
  });
}

function add(name, data) {
  console.log("adding: " + name + ": " + data);
}
