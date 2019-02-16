var express = require('express');
const port = 8080;

var app = express();
var server = app.listen(process.env.PORT || 8080, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server Started');
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
