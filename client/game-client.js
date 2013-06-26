var Game =(function(){
	Player = Player.constructor;
	Effect = Effect.constructor;
	
	function Game(){
		var board = {
			'height': 600, 'width': 800, 
			'players': new Utils.JsDictionary(), 
			'effects': new Utils.JsDictionary(),
			'hazards': new Utils.JsDictionary()
		};
		var myId = 0;
		var keysPressed = new Utils.JsDictionary();
		var gLoop = 0;
		var FPS = 25;
		var socket;
		
		var c = document.getElementById('board');
		var ctx = c.getContext('2d');

		function clear(){
			ctx.fillStyle = '#000';
			ctx.clearRect(0, 0, board.width, board.height);
			ctx.fillRect(0, 0, board.width, board.height);
		}

		function copyEffectToClient(data){
			board.effects.add(data.id, ObjectFactory.createEffectFromConfig(data.config));
			Utils.copyTo(board.effects.get(data.id), data);
		}

		function createPlayer(playerObj){
			var tmpPlayer = new Player(playerObj);
		}

		this.getContext = function(){ return ctx; }
		this.getHeight = function(){ return board.height; }
		this.getKeysPressed = function(){ return keysPressed; }
		this.getWidth = function(){	return board.width; }

		this.init = function(players){
			c.height = board.height;
			c.width = board.width;

			socket = io.connect('192.168.56.1:8001');
			socket.on(Enums.SocketMessage.load, function(data){
				clear();
				
				myId = data.id;
						
				initBoard(data.board);
			
				document.addEventListener('keydown', function(e){
					keysPressed.add(e.keyCode, true);
				});					
				document.addEventListener('keyup', function(e){
					keysPressed.remove(e.keyCode);
				});

				runLoop();
			});

			// when the server creates and effect ('power-up') and places it on the board
			socket.on(Enums.SocketMessage.effectAdded, copyEffectToClient);
			// when the server verifies that this client was the first to collect the effect
			socket.on(Enums.SocketMessage.effectCollected, onEffectCollected);
			// when any player should no longer be drawn
			socket.on(Enums.SocketMessage.removePlayer, onRemovePlayer);			
			// when any effect should no longer be drawn
			socket.on(Enums.SocketMessage.removeEffect, onRemoveEffect);			
			// the server will inform us of other players updates by telling us to 'updatePlayer'
			socket.on(Enums.SocketMessage.updatePlayer, onUpdatePlayer);

			window.onunload = function(){
				socket.disconnect();
			}
		}
		
		function initBoard(boardObj){
			for(var i = 0; i < boardObj.players.length; i++){
				var player = boardObj.players[i];
				// copy the list of players from the server to the client 
				board.players.add(player.id, new Player(boardObj.players[i]));
			}
			
			board.players.get(myId).setColor(0,255,0);

			for(i = 0; i < boardObj.effects.length; i++){
				var effect = boardObj.effects[i];
				copyEffectToClient(effect);
			}
		}
		
		function onEffectCollected(effect){
			var player = board.players.get(myId);
			player.effects.get(effect.property) += effect.value;
		}

		function onRemovePlayer(id){
			board.players.remove(id);
		}

		function onRemoveEffect(id){
			board.effects.remove(id);
		}

		function onUpdatePlayer(playerConfig){
			if(!board.players.get(playerConfig.id))
				board.players.add(playerConfig.id, new Player(playerConfig));
			else
				Utils.copyTo(board.players.get(playerConfig.id), playerConfig);
		}

		function processBoardObjects(){
			var playerKeys = board.players.getKeys();
			for(var i = 0; i < playerKeys.length; i++){
				var player = board.players.get(playerKeys[i]);
				player.process();
				player.draw();
			}

			var effectValues = board.effects.getValues();
			for(var i = 0; i < effectValues.length; i++){
				effectValues[i].draw();
			}
		}

		function runLoop(){
			clear();
			
			// tell sever what keys are pressed
			if(keysPressed.length() > 0)
				socket.emit(Enums.SocketMessage.keysPressed, keysPressed.getKeys());
			
			processBoardObjects();
			gLoop = setTimeout(runLoop, 1000/FPS);
		}
	}

	return Game;
})();

