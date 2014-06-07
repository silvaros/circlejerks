define([
	'jquery',

	'common/appInit',
	'Utils',
	'GameEngine',
	'Enums',
	'socket.io/socket.io'
],
function($, ai, Utils, GameEngine, Enums, io) {
	var myId = 0;
	var keysPressed = new Utils.JsDictionary();
	var gLoop = 0;
	var FPS = 20;
	var socket;
	
	var c = document.getElementById('board');
	var ctx = c.getContext('2d');

	var wRatio = 16;
	var hRatio = 9;

	function scaleCanvasToWindowSize(){
		//keep canvas in sync
		var w = window.innerWidth - $("#divPlayerInventory").width() - 2;
		var h = window.innerHeight;

		var scaledSize = getScaledSize(h, w);
		c.style.width =  scaledSize.w + 'px';
		c.style.height = scaledSize.h + 'px';
	}

	$(window).on('resize', scaleCanvasToWindowSize);

	function clear(){
		ctx.fillStyle = '#000';
		ctx.clearRect(0, 0, board.width, board.height);
		ctx.fillRect(0, 0, board.width, board.height);
	}

	function getScaledClick(clickEvt){
		var cClientW = c.style.width != "" ? c.style.width.substr(0, c.style.width.length - 2) : c.width;
		var cClientH = c.style.height != "" ? c.style.height.substr(0, c.style.height.length - 2) : c.height;

		var xRatio = c.width / cClientW;	
		var yRatio = c.height / cClientH;

		return {x: clickEvt.clientX *xRatio, y: clickEvt.clientY *yRatio }
	}

	function getScaledSize(h, w){
		var scaledH = h * wRatio;
		var scaledW = w * hRatio;

		// perfect aspect ratio
		if(scaledW == scaledH) return {'h':h, 'w':w};
		//if the new width would be too much
		if(scaledW > scaledH){
			var dif = (scaledW - scaledH)/hRatio;
			return {'h':h, 'w':w - dif};
		}
		//if the new width would be too much
		if(scaledW < scaledH){
			var dif = (scaledH - scaledW)/wRatio;
			return {'h':h - dif, 'w':w};
		}	
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
		init: function(players){
			scaleCanvasToWindowSize();

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
				document.addEventListener('keydown', function(e){keysPressed.add(e.keyCode, true);});
				document.addEventListener('keyup', function(e){keysPressed.remove(e.keyCode);});

				document.getElementById('board').onclick = function(clickPos){
					GameEngine.onWeaponFired(myId, getScaledClick(clickPos));
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

