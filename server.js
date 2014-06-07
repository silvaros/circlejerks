var express = require('express') 
  ,	app = express()
  , server = require('http').createServer(app)
  
  , io = require('socket.io').listen(server)
  ,	requirejs = require('requirejs')

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});
app.get('/test', function(req, res){
  res.sendfile(__dirname + '/test.html');
});
app.use(express.static(__dirname));


server.listen(8000);
console.log("Listening on WNOD, port 8000");

requirejs.config({
	waitSeconds: 0,
  nodeRequire: require,
	baseUrl: './',
	paths: {
        Actor: 'common/actors/Actor',
        Player: 'common/actors/Player',
        GameEngine: 'common/GameEngine',
        Utils: 'common/utils/utils',
        MathUtils: 'common/utils/mathUtils',
        GraphicsUtils: 'client/graphicsUtils',
        Enums: 'common/Enums',
        GameServer: 'server/GameServer',
        WeaponFactory: 'common/WeaponFactory'
	}
});

requirejs(['./common/appInit'], function(){
  var game = requirejs('GameServer');
	game.init();
	io.sockets.on('connection', game.onConnection);
});






