var express = require('express') 
  ,	app = express()
  , http = require('http')
  , server = http.createServer(app)
  
app.get('/', function(req, res){
	res.sendfile(__dirname + '/test.html');
});
app.use(express.static(__dirname));

server.listen(8000);