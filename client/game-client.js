var Game =(function(){
	function Game(){
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

		this.getContext = function(){ return ctx; }
		this.getHeight = function(){ return board.height; }
		this.getKeysPressed = function(){ return keysPressed; }
		this.getWidth = function(){	return board.width; }

		this.init = function(players){
			socket = io.connect('127.0.0.1:8000');
			socket.on(Enums.SocketMessage.load, function(data){
				myId = data.id;
				GameEngine.initBoard(data.board, myId);
				c.height = GameEngine.getBounds().bottom;
				c.width = GameEngine.getBounds().right;
			
				clear();
								
				document.addEventListener('keydown', function(e){
					keysPressed.add(e.keyCode, true);
				});					
				document.addEventListener('keyup', function(e){
					keysPressed.remove(e.keyCode);
				});

				runLoop();
			});

			// when the server creates and effect ('power-up') and places it on the board
		//	socket.on(Enums.SocketMessage.effectAdded, GameEngine.copyEffectToClient);
			// when the server verifies that this client was the first to collect the effect
		//	socket.on(Enums.SocketMessage.effectCollected, GameEngine.onEffectCollected);
			// when any player should no longer be drawn
			socket.on(Enums.SocketMessage.removePlayer, GameEngine.onRemovePlayer);			
			// when any effect should no longer be drawn
			socket.on(Enums.SocketMessage.removeEffect, GameEngine.onRemoveEffect);			
			// the server will inform us of other players updates by telling us to 'updatePlayer'
			socket.on(Enums.SocketMessage.updatePlayer, GameEngine.onUpdatePlayer);

			window.onunload = function(){
				socket.disconnect();
			}
		}
		
		function runLoop(){
			clear();
			
			// tell sever what keys are pressed
			if(keysPressed.length() > 0){
				socket.emit(Enums.SocketMessage.keysPressed, keysPressed.getKeys());
				GameEngine.onKeyPressed(myId, keysPressed.getKeys());
			}
			
			GameEngine.processBoardObjects();
			GameEngine.drawBoardObjects(ctx)

			gLoop = setTimeout(runLoop, 1000/FPS);
		}
	}

	return Game;
})();

