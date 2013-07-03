(function(exports){
	Player = (typeof Player != "undefined" ? Player : require('../common/Player')).constructor;
	MathUtils = typeof MathUtils != "undefined" ? MathUtils : require('../common/mathUtils');

	var board = {
		'height': 0, 'width': 0, 
		'players': new Utils.JsDictionary(), 
		'effects': new Utils.JsDictionary(),
		'hazards': new Utils.JsDictionary()
	}
	
	//-- Private functions --//
	function checkPlayerOnEffectCollision(curPlayer){
		var effectIds = board.effects.getKeys();
		// check collision vs power-ups/downs
		for(i = 0; i < effectIds.length; i++){
			var curEffect = board.effects.get(effectIds[i]);
			
			//console.log('dist from ' + curPlayer.id + ' to ' + curEffect.id + 'is ' + MathUtils.distanceBetween(curPlayer, curEffect)	);
			if(MathUtils.distanceBetween(curPlayer, curEffect) <= Math.pow(curPlayer.getRadius()/2 + curEffect.getRadius()/2, 2)){
				//console.log('collision detected');
		
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
			console.log("~~~~~~~~~ Collision ~~~~~~~~~~~~~``")
			Utils.applyPlayerCollision(curPlayer, otherPlayer);
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
	}

	function onEffectCollected(effect){
		var player = board.players.get(myId);
		player.effects.get(effect.property) += effect.value;
	}

	exports.checkCollisions = function(){
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
	
	exports.addPlayer = function(id, playerConfig){
		if(!board.players.get(id))
			board.players.add(id, exports.createPlayer(id, playerConfig));
		else
			Utils.copyTo(board.players.get(id), playerConfig);

		return board.players.get(id);
	}

	exports.createPlayer = function(id, playerConfig){
		if(typeof playerConfig == 'object') return new Player(playerConfig);

		var x = Math.round(Math.random()*(board.width));
		var y = Math.round(Math.random()*(board.height));
		return new Player({'id': id, 'p': new MathUtils.Vector(x, y)});
	}

	exports.drawBoardObjects = function(ctx){
		var playerKeys = board.players.getKeys();
		for(var i = 0; i < playerKeys.length; i++){
			var player = board.players.get(playerKeys[i]);
			player.draw(ctx);
		}

		var effectValues = board.effects.getValues();
		for(var i = 0; i < effectValues.length; i++){
			effectValues[i].draw(ctx);
		}
	}

	exports.getBounds = function(){
		return { top: 0, left: 0, bottom: board.height, right: board.width };
	}

	// if an id is passed get data for a specific player, else get data for all players
	exports.getPlayerData = function(id){
		if(id != undefined){
			var player = board.players.get(id);
			if(player) return player.toJSON();
		}
		else {
			return board.players.toJSON();
		}
	}

	exports.getBoardData = function(){
		return {
			'height': board.height,
			'width': board.width,
			'players': exports.getPlayerData(),
			'effects': board.effects.toJSON(),
			'hazards': board.hazards.toJSON()	
		}
	}

	exports.initBoard = function(boardObj, playerId){
		if(!boardObj) boardObj = {};

		board.height = boardObj.height || 600;
		board.width = boardObj.width || 800;

		//when we init the board for a client
		if(boardObj.players){
			for(var pId in boardObj.players){
				var player = boardObj.players[pId];
				// copy the list of players from the server to the client 
				exports.addPlayer(pId, player);
			}
		}

		/*if(boardObj.effects)
			for(i = 0; i < boardObj.effects.length; i++){
				var effect = boardObj.effects[i];
				copyEffectToClient(effect);
			}
		}			
		*/
		
		if(playerId !== undefined){
			board.players.get(playerId).setColor(0,255,0);
		}
	}

	exports.onKeyPressed = function(playerId, keysPressed){
		if(keysPressed.indexOf('87') > -1 || keysPressed.indexOf('65') > -1 ||
			keysPressed.indexOf('83') > -1 || keysPressed.indexOf('68') > -1)
		{
			var player = board.players.get(playerId);
			var newVelocity = new MathUtils.Vector(player.v.x, player.v.y);
			var accel = player.getPropertyValue(Enums.PlayerProperties.accel);
			//console.log('player accel = ' + accel)
			var maxSpeed = player.getPropertyValue(Enums.PlayerProperties.speed, "max");

			// w			
			if(keysPressed.indexOf('87') > -1){
				 //console.log('adding - accel to newVelocity')
				 newVelocity.y -= accel;
				 //console.log('newVelocity.y after - accel = ' + newVelocity.y)
				 if(newVelocity.y < -maxSpeed){newVelocity.y = -maxSpeed}
				 //console.log('newVelocity.y maxSpeed check = ' + newVelocity.y)
			}	
			// a
			if(keysPressed.indexOf('65') > -1){
				 newVelocity.x -= accel;
				 if(newVelocity.x < -maxSpeed){newVelocity.x = -maxSpeed}
			}
			// s
			if(keysPressed.indexOf('83') > -1){
				//console.log('adding + accel to newVelocity')
				 newVelocity.y += accel;
				if(newVelocity.y > maxSpeed){newVelocity.y = maxSpeed}
			}
			// d
			if(keysPressed.indexOf('68') > -1){
				newVelocity.x += accel;
				if(newVelocity.x > maxSpeed){newVelocity.x = maxSpeed}
			}
			//console.log('newVelocity.x = ' + newVelocity.x)
			//console.log('newVelocity.y = ' + newVelocity.y)
			//console.log('player.x = ' + player.v.x)
			//console.log('player.y = ' + player.v.y)
			if(newVelocity.x != player.v.x || newVelocity.y != player.v.y){
				var player = board.players.get(playerId);
				// return the properties that changed
				Utils.copyTo(player, {'v': newVelocity}, true);
			}
		}
		// end if w,s,a,d
	}

	exports.onSyncClient = function(playersConfig, clientId){
		for(var playerId in playersConfig){
			Utils.copyTo(board.players.get(playerId), playersConfig[playerId] || {});
		}
	}

	exports.processBoardObjects = function(){
		var playerKeys = board.players.getKeys();
		for(var i = 0; i < playerKeys.length; i++){
			var player = board.players.get(playerKeys[i]);
			player.process();
			player.move(exports.getBounds());
		}

		var effectValues = board.effects.getValues();
		for(var i = 0; i < effectValues.length; i++){
			effectValues[i].process();
		}
	}

	exports.removePlayer = function(id){
		board.players.remove(id);
	}
})(typeof exports === 'undefined'? this['GameEngine'] = {} : exports);