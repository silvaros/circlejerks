(function(exports){
	var Utils = require('../common/utils');
	var MathUtils = require('../common/mathUtils');
	var Player = require('../common/Player').constructor;
	var ObjectFactory = require('../common/ObjectFactory');
	var Enums = require('../common/Enums');

	var board = {
		'height': 600, 'width': 800, 
		'players': new Utils.JsDictionary(), 
		'effects': new Utils.JsDictionary(),
		'hazards': new Utils.JsDictionary()
	};
	var counter = 0;
	var gLoop = 0;
	var loopsPerSec = 25;
	var sockets = {};
	
	//-- Private functions --//
	function checkCollisions(){
		var playerIds = board.players.getKeys();
		do{
			var curPlayerId = playerIds.pop();
			var curPlayer = board.players.get(curPlayerId);
			if(curPlayer){
				// check collision vs other players
				for(var i = 0; i < playerIds.length; i++){
					var otherPlayer = board.players.get(playerIds[i]);
					checkPlayerOnPlayerCollision(curPlayer, otherPlayer);
				}
				
				checkPlayerOnEffectCollision(curPlayer);
				
				checkPlayerOnHazardCollision(curPlayer);
			}
		}
		while(playerIds.length > 0);
	}	
		
	function checkPlayerOnEffectCollision(curPlayer){
		var effectIds = board.effects.getKeys();
		// check collision vs power-ups/downs
		for(i = 0; i < effectIds.length; i++){
			var curEffect = board.effects.get(effectIds[i]);
			
			//console.log('dist from ' + curPlayer.id + ' to ' + curEffect.id + 'is ' + MathUtils.distanceBetween(curPlayer, curEffect)	);
			if(MathUtils.distanceBetween(curPlayer, curEffect) <= Math.pow(curPlayer.getRadius()/2 + curEffect.getRadius()/2, 2)){
				console.log('collision detected');
		
				// tell the player they got the effect
 				sockets[curPlayer.id].emit(Enums.SocketMessage.effectCollected, curEffect.id);
				emitToClients(Enums.SocketMessage.removeEffect, curEffect.id, [curPlayer.id]);

				board.effects.remove(curEffect.id);
			}
		}
	}	
	
	function checkPlayerOnHazardCollision(curPlayer){
		var hazardIds = board.hazards.getKeys();
		
		// check collision vs power-ups/downs
		/*for(i = 0; i < hazardIds.length; i++){
			var curHazard = board.hazards.get(hazardIds[i]);
			if(MathUtils.distanceBetween(curPlayer, curHazard) <= curPlayer.getRadius()/2 + curHazard.getRadius()/2){
				// tell the player they got the effect
 				//sockets[curPlayerId].emit(Enums.SocketMessage.effectCollected, curHazard.id);

				delete board.hazards[curHazard.id];
			}
		}*/
	}
	
	function checkPlayerOnPlayerCollision(curPlayer, otherPlayer){
		var distance = MathUtils.distanceBetween(curPlayer, otherPlayer);
		if(distance <= Math.pow(curPlayer.getRadius() + otherPlayer.getRadius(), 2)){
			//do collision stuff
//			console.log("~~~~~~~~~ Collision ~~~~~~~~~~~~~``")
			Utils.applyPlayerCollision(curPlayer, otherPlayer);
			
			emitToClients(Enums.SocketMessage.updatePlayer, curPlayer);
			emitToClients(Enums.SocketMessage.updatePlayer, otherPlayer);
		}
	}
	
	function gameLoop(){
		gLoop = setTimeout(gameLoop, 1000/loopsPerSec);
		
		//processEffects();
		//checkCollisions();
	}

	function getPlayerData(id){
		if(id != undefined){
			var player = board.players.get(id);
			if(player) return player.getData();
		}
		else {
			var players = [];
			var keys = board.players.getKeys();
			for(var i = 0; i < keys.length; i++){
				var player = board.players.get(keys[i]);
				players.push(player.getData());
			}
			return players;
		}
	}

	function processEffects(){
		var effectKeys = board.effects.getKeys();
		for(var i=0; i < effectKeys.length; i++){
			var id = effectKeys[i];
			var effect = board.effects.get(id); 
			
			if(effect.shouldRemove()){
				emitToClients(Enums.SocketMessage.removeEffect, id);
				board.effects.remove(id);
			}
			else
				effect.incrementTimer(1000/loopsPerSec);
		}

		var rand = Math.floor(Math.random()*100);
		// add new effects after the increment 		
		if(rand < 1){	
			var newEffect = ObjectFactory.createEffectForProperty('speed');
			var newVec = new MathUtils.Vector(Math.random()*board.width, Math.random()*board.height)
			Utils.copyTo(newEffect, {p: newVec}); 
		
			board.effects.add(newEffect.id, newEffect);
			emitToClients(Enums.SocketMessage.effectAdded, newEffect);
		}	
	}	

	function onKeyPressed(playerId, keysPressed){
		if(keysPressed.indexOf('87') > -1 || keysPressed.indexOf('65') > -1 ||
			keysPressed.indexOf('83') > -1 || keysPressed.indexOf('68') > -1)
		{
			var player = board.players.get(playerId);
			var newVec = new MathUtils.Vector(player.v.x, player.v.y);
			var accel = player.getPropertyValue(Enums.PlayerProperties.accel);
			console.log('player accel = ' + accel)
			var maxAccel = player.getPropertyValue(Enums.PlayerProperties.accel, "max");

			// w			
			if(keysPressed.indexOf('87') > -1){
				 console.log('adding - accel to newvec')
				 newVec.y -= accel;
				 console.log('newVec.y after - accel = ' + newVec.y)
				 if(newVec.y < -maxAccel){newVec.y = -maxAccel}
				 console.log('newVec.y maxAccel check = ' + newVec.y)
			}	
			// a
			if(keysPressed.indexOf('65') > -1){
				 newVec.x -= accel;
				 if(newVec.x < -maxAccel){newVec.x = -maxAccel}
			}
			// s
			if(keysPressed.indexOf('83') > -1){
				console.log('adding + accel to newvec')
				 newVec.y += accel;
				if(newVec.y > maxAccel){newVec.y = maxAccel}
			}
			// d
			if(keysPressed.indexOf('68') > -1){
				newVec.x += accel;
				if(newVec.x > maxAccel){newVec.x = maxAccel}
			}
			console.log('newVec.x = ' + newVec.x)
			console.log('newVec.y = ' + newVec.y)
			console.log('player.x = ' + player.v.x)
			console.log('player.y = ' + player.v.y)
			if(newVec.x != player.v.x || newVec.y != player.v.y){
				console.log('updating player vec')
				updatePlayer({'id': playerId, 'v': newVec});
			}
		}
		// end if w,s,a,d
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
		delete board.players.remove(id);					
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
		
		var x = Math.round(Math.random()*(board.width));
		var y = Math.round(Math.random()*(board.height));
		var newPlayer = new Player({
			'id': id, 'p': new MathUtils.Vector(x, y)
		});
		
		board.players.add(id, newPlayer);
		console.log('player in onConnection: %j', newPlayer);
		
		socket.on(Enums.SocketMessage.keysPressed, function(keys){ onKeyPressed(id, keys)} );
		socket.on('disconnect', function(){onPlayerDisconnect(id)});
		
		socket.emit(Enums.SocketMessage.load, {'id': id, 'board': {
			'players': getPlayerData(),
			'effects': board.effects.getValues(),
			'hazards': board.hazards.getValues()	
		}});
		
		emitToClients(Enums.SocketMessage.updatePlayer, newPlayer, [id]);
	}

	exports.init = function(){
		gameLoop();
	}

})(exports);

