var express = require('express') 
  ,	app = express.createServer()
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , game = require('./server/game-server')

app.listen(8001);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

io.sockets.on('connection', game.onConnection);
game.init();



