define([
	'lodash', 'GameEngine', 'Utils'
],
function(_, GameEngine, Utils){
	var idCounter = 0;
	var loopCounter = 0;
	var gLoop = 0;
	var FPS = 20;
	var sockets = {};
	var ns = 'GameServer';

	function gameLoop(){
		gLoop = setTimeout(gameLoop, 1000/FPS);
		loopCounter++;

		//get initial state of the players
		var playerState = GameEngine.getPlayerData();
		
		GameEngine.processBoardObjects();
		GameEngine.checkCollisions();

		if(loopCounter == 3){
			loopCounter = 0;
			var changed = Utils.copyTo(playerState, GameEngine.getPlayerData(), true);
			if(changed){
				//console.log("in game loop - changed = %j", changed);
				emitToClients(Enums.EngineMessage.syncClient, changed)
			}
		}

		// randomly add new affects
		/*var rand = Math.floor(Math.random()*100);
		// add new effects after the increment 		
		if(rand < 1){	
			var newEffect = ObjectFactory.createEffectForProperty('speed');
			var newVec = new MathUtils.Vector(Math.random()*board.width, Math.random()*board.height)
			Utils.copyTo(newEffect, {p: newVec}); 
		
			board.effects.add(newEffect.id, newEffect);
			emitToClients(Enums.EngineMessage.effectAdded, newEffect);
		}	
		*/
	}

	// socket functions //
	function emitToClients(channel, data, excludeClients){
		//console.log("in emit, exclued = " + excludeClients);
		for(var socketId in sockets)
			if(excludeClients == undefined || excludeClients.indexOf(socketId) == -1){
				//console.log('emitting to client ' + typeof socketId);
				sockets[socketId].emit(channel, data);		
			}
	}
		
	function onEffectCollision(id, effectId){
		var effect = effects[effectId];
		if(effect){
			sockets[id].emit(Enums.EngineMessage.effectCollected, {'lifespan': effect.getLifespan(), 'value': effect.getValue(), 'property': effect.getProperty()});
			
			// add to player on server side		
					
			// if an effect is collected remove it and announce it
			delete effects.remove(effectId);
			emitToClients(Enums.EngineMessage.removeEffect, effectId);
		}
	}

	function onPlayerDisconnect(id){
		//console.log('in Player disconnect')
		// if a player disconnects tell everyone so they can remove him from their board
		emitToClients(Enums.EngineMessage.removePlayer, id);		
		delete GameEngine.removePlayer(id);					
		delete sockets[id];
	}

	return {
		num: 5, 
		onConnection: function(socket) {	
			//console.log('start on onConnection')
			if(idCounter > 100) idCounter = 1;
			// make this a string to avoid confusion
			var id = ++idCounter + Math.round(Math.random()*100) + '';
			sockets[id] = socket;
			
			GameEngine.addPlayer(id);
			//console.log('player in onConnection: %j', GameEngine.getPlayerData(id));
			
			socket.on(Enums.EngineMessage.keysPressed, function(keys){
				changed = GameEngine.onKeyPressed(id, keys);
			});
			socket.on('disconnect', function(){ onPlayerDisconnect(id); });
			
			// send the board data to the new client
			socket.emit(Enums.EngineMessage.load, {'id': id, 'board': GameEngine.getBoardData()});
			// inform all other clients a new player joined
			emitToClients(Enums.EngineMessage.playerJoined, GameEngine.getPlayerData(id), [id]);
		},

		init: function(){
			gameLoop();
		}
	};
});

	