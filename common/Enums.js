(function(exports){
	exports.SocketMessage = {
		"collision":		'0', 
		"effectAdded": 		'1',
		"effectCollected": 	'2',
		"keysPressed": 		'3',
		"removeEffect": 	'4',
		"removePlayer": 	'5',
		"updatePlayer": 	'6'
	}

	exports.EffectConfig = {
		"effectLifespan": 	'0',
		"property": 		'1',
		"value": 			'2',
		"visibleLifespan": 	'3'
	}
	
	exports.PlayerProperties = {
		'accel': 			'0',
		'attack': 			'1',
		'defence': 			'3',
		'elasticity': 		'4',
		'friction': 		'5',
		'health': 			'6',
		'mass': 			'7',
		'speed': 			'8'
	},
	
	exports.Hazard = {
		"blackHole":		'0',
		"spikeBall": 		'1'
	}
	
})(typeof exports === 'undefined'? this['Enums'] = {} : exports);


