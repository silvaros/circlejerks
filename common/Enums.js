define([],
function(){
	var ns = 'Enums';
	return CJ.namespace(ns, {
		EngineMessage: {
			"collision":		'0', 
			"effectAdded": 		'1',
			"effectCollected": 	'2',
			"keysPressed": 		'3',
			"load": 			'4', 
			"playerJoined":		'5',
			"removeEffect": 	'6',
			"removePlayer": 	'7',
			"syncClient": 		'8'
		},

		EffectConfig: {
			"effectLifespan": 	'0',
			"property": 		'1',
			"value": 			'2',
			"visibleLifespan": 	'3'
		},
		
		PlayerAction: {
			'weaponFired' :  	'0'
		},

		PlayerProperties: {
			'accel': 			'0',
			'attack': 			'1',
			'defence': 			'3',
			'elasticity': 		'4',
			'friction': 		'5',
			'health': 			'6',
			'mass': 			'7',
			'speed': 			'8'
		},
		
		Hazard: {
			"blackHole":		'0',
			"spikeBall": 		'1'
		}
	})
});


