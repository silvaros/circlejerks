define([
	'common/appInit',
	'Utils',
	'GameEngine',
	'Enums',
	'socket.io/socket.io'
],
function(ai, Utils, GameEngine, Enums, io) {
	var myId = 0;
	var keysPressed = new Utils.JsDictionary();
	var gLoop = 0;
	var FPS = 20;
	var socket;
	
	var c = document.getElementById('board');
	var ctx = c.getContext('2d');

	function clear(){
		ctx.fillStyle = '#000';
		ctx.clearRect(0, 0, board.width, board.height);
		ctx.fillRect(0, 0, board.width, board.height);
	}

	function runLoop(){
		clear();

		// tell sever what keys are pressed
		if(keysPressed.length() > 0){
			socket.emit(Enums.EngineMessage.keysPressed, keysPressed.getKeys());
			GameEngine.onKeyPressed(myId, keysPressed.getKeys());
		}
		
		GameEngine.processBoardObjects();
		GameEngine.checkCollisions();
		GameEngine.drawBoardObjects(ctx);

		gLoop = setTimeout(runLoop, 1000/FPS);
	}

	return CJ.namespace("GameClient", {			
		getContext: function(){ return ctx; },
		getHeight: function(){ return board.height; },
		getKeysPressed: function(){ return keysPressed; },
		getWidth: function(){	return board.width; },

		init: function(players){
			socket = io.connect('127.0.0.1:8000');
			socket.on(Enums.EngineMessage.load, function(data){
				myId = data.id;
				
				GameEngine.initBoard(data.board, myId);
				c.height = GameEngine.getBounds().bottom;
				c.width = GameEngine.getBounds().right;

				var me = GameEngine.getPlayer(myId);
				me.addWeapon("bullet");
				me.addWeapon("bullet");
				me.addWeapon("laser");
				me.addWeapon("grenade");
				me.addWeapon("spike");
							
				// Listeners
				document.addEventListener('keydown', function(e){
					keysPressed.add(e.keyCode, true);
				});					
				document.addEventListener('keyup', function(e){
					keysPressed.remove(e.keyCode);
				});

				document.getElementById('board').onclick = function(clickPos){
					GameEngine.onWeaponFired(myId, {x: clickPos.clientX, y: clickPos.clientY});
					socket.emit(Enums.PlayerAction.weaponFired, clickPos);
				}

				window.onblur = function(){
					keysPressed.clear();
				}
	
				runLoop();
			});

			// when the server creates and effect ('power-up') and places it on the board
		//	socket.on(Enums.EngineMessage.effectAdded, GameEngine.copyEffectToClient);
			// when the server verifies that this client was the first to collect the effect
		//	socket.on(Enums.EngineMessage.effectCollected, GameEngine.onEffectCollected);
			// when any player should no longer be drawn
			socket.on(Enums.EngineMessage.removePlayer, GameEngine.removePlayer);			
			// when any effect should no longer be drawn
		//	socket.on(Enums.EngineMessage.removeEffect, GameEngine.onRemoveEffect);			
			// when another player joins
			socket.on(Enums.EngineMessage.playerJoined, function(data){ GameEngine.addPlayer(data.id, data); });
			// the server will inform us of other players updates by telling us to 'updatePlayer'
			socket.on(Enums.EngineMessage.syncClient, function(data){ GameEngine.onSyncClient(data, myId); });

			window.onunload = function(){
				socket.disconnect();
			}
		}
	})
});

