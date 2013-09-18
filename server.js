var express = require('express') 
  ,	app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  ,	requirejs = require('requirejs')

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

server.listen(8000);

requirejs.config({
	waitSeconds: 0,
  nodeRequire: require,
	baseUrl: './',
	paths: {
        Player: 'common/Player',
        GameEngine: 'common/GameEngine',
        Utils: 'common/utils/utils',
        MathUtils: 'common/utils/mathUtils',
        GraphicsUtils: 'client/graphicsUtils',
        Enums: 'common/Enums',
        GameServer: 'server/GameServer',
        WeaponFactory: 'common/WeaponFactory'
	}
});

requirejs([
	'./common/appInit'
],
function(ai){
  var game = requirejs('GameServer');
	game.init();
	io.sockets.on('connection', game.onConnection);
});






