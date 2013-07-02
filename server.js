var express = require('express') 
  ,	app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , game = require('./server/game-server')

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

server.listen(8000);
game.init();

io.sockets.on('connection', game.onConnection);




