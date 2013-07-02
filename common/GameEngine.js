(function(exports){
	Player = (typeof Player != "undefined" ? Player : require('../common/Player')).constructor;
	MathUtils = typeof MathUtils != "undefined" ? MathUtils : require('../common/mathUtils');

	var board = {
		'height': 0, 'width': 0, 
		'players': new Utils.JsDictionary(), 
		'effects': new Utils.JsDictionary(),
		'hazards': new Utils.JsDictionary()
	};
	
	var gLoop = 0;
	var FPS = 25;

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


	function onUpdatePlayer(playerConfig){
		if(!board.players.get(playerConfig.id))
			board.players.add(playerConfig.id, new Player(playerConfig));
		else
			Utils.copyTo(board.players.get(playerConfig.id), playerConfig);
	}

	exports.addPlayer = function(id, player){
		board.players.add(id, player);
	}

	exports.createPlayer = function(id){
		var x = Math.round(Math.random()*(board.width));
		var y = Math.round(Math.random()*(board.height));
		var newPlayer = new Player({
			'id': id, 'p': new MathUtils.Vector(x, y)
		});
		
		return newPlayer;
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

	exports.getBoardData = function(){
		return {
			'height': board.height,
			'width': board.width,
			'players': exports.getPlayerData(),
			'effects': board.effects.getValues(),
			'hazards': board.hazards.getValues()	
		}
	}

	exports.initBoard = function(boardObj, playerId){
		if(!boardObj) boardObj = {};

		board.height = boardObj.height || 600;
		board.width = boardObj.width || 800;

		//when we init the board for a client
		if(boardObj.players){
			for(var i = 0; i < boardObj.players.length; i++){
				var player = boardObj.players[i];
				// copy the list of players from the server to the client 
				board.players.add(player.id, new Player(boardObj.players[i]));
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
			var newVec = new MathUtils.Vector(0, 0);
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
				var player = board.players.get(playerId);
				// return the properties that changed
				return Utils.copyTo(player, {'v': newVec} );
			}
		}
		// end if w,s,a,d
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