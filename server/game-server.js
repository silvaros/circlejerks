(function(exports){
	var Utils = require('../common/utils');
	var MathUtils = require('../common/mathUtils');
	var Player = require('../common/Player').constructor;
	var ObjectFactory = require('../common/ObjectFactory');
	var Enums = require('../common/Enums');
	var GameEngine = require('../common/GameEngine')

	GameEngine.initBoard({'height': 600, 'width': 800});

	var counter = 0;
	var gLoop = 0;
	var loopsPerSec = 25;
	var sockets = {};
	
	function gameLoop(){
		gLoop = setTimeout(gameLoop, 1000/loopsPerSec);
		
		GameEngine.processBoardObjects();

		// randomly add new affects
		/*var rand = Math.floor(Math.random()*100);
		// add new effects after the increment 		
		if(rand < 1){	
			var newEffect = ObjectFactory.createEffectForProperty('speed');
			var newVec = new MathUtils.Vector(Math.random()*board.width, Math.random()*board.height)
			Utils.copyTo(newEffect, {p: newVec}); 
		
			board.effects.add(newEffect.id, newEffect);
			emitToClients(Enums.SocketMessage.effectAdded, newEffect);
		}	
		*/
		//GameEngine.checkCollisions();
	}

	// socket functions //
	function emitToClients(channel, data, excludeClients){
		for(var socketId in sockets)
			if(excludeClients == undefined || excludeClients.indexOf(socketId) == -1)			
				sockets[socketId].emit(channel, data);		
	}
		
	function onEffectCollision(id, effectId){
		var effect = effects[effectId];
		if(effect){
			sockets[id].emit(Enums.SocketMessage.effectCollected, {'lifespan': effect.getLifespan(), 'value': effect.getValue(), 'property': effect.getProperty()});
			
			// add to player on server side		
					
			// if an effect is collected remove it and announce it
			delete effects.remove(effectId);
			emitToClients(Enums.SocketMessage.removeEffect, effectId);
		}
	}

	function onPlayerDisconnect(id){
		// if a player disconnects tell everyone so they can remove him from their board
		emitToClients(Enums.SocketMessage.removePlayer, id);		
		delete GameEngine.removePlayer(id);					
		delete sockets[id];
	}

	function updatePlayer(playerObj){
		console.log('in updatePlayer, playerObj = ' + playerObj);

		var player = board.players.get(playerObj.id);
		var changedProps = Utils.copyTo(player, playerObj);
		console.log('emitting update player')
 		emitToClients(Enums.SocketMessage.updatePlayer, changedProps);
	}

	// end socket functions //
	// end private functions //

	//-- Public functions --//
	exports.onConnection = function(socket) {	
		console.log('start on onConnection')
		if(counter > 100) counter = 1;
		var id = ++counter + Math.round(Math.random()*100);
		sockets[id] = socket;
		
		var newPlayer = GameEngine.createPlayer(id);
		GameEngine.addPlayer(id, newPlayer);
		console.log('player in onConnection: %j', newPlayer);
		
		socket.on(Enums.SocketMessage.keysPressed, function(keys){
			var changed = GameEngine.onKeyPressed(id, keys);
			// if the key press caused the player to move, inform everyone
			if(changed) emitToClients(Enums.SocketMessage.updatePlayer, changed, [id])
		});
		socket.on('disconnect', function(){ onPlayerDisconnect(id); });
		
		// send the board data to the new client
		socket.emit(Enums.SocketMessage.load, {'id': id, 'board': GameEngine.getBoardData()});
		// inform all other clients a new player joined
		emitToClients(Enums.SocketMessage.updatePlayer, GameEngine.getPlayerData(id), [id]);
	}

	exports.init = function(){
		gameLoop();
	}
})(exports);

