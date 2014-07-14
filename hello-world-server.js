var http = require('http');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('Hello world! restart test!');
});

server.listen(8090);
console.log('Server is started on port 8090 !!!');
