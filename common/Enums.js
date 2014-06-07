define(function(){
	var ns = 'Enums';
	return CJ.namespace(ns, {
		EngineMessage: {
			"collision":		'EM0', 
			"effectAdded": 		'EM1',
			"effectCollected": 	'EM2',
			"keysPressed": 		'EM3',
			"load": 			'EM4', 
			"playerJoined":		'EM5',
			"removeEffect": 	'EM6',
			"removePlayer": 	'EM7',
			"syncClient": 		'EM8'
		},

		EffectConfig: {
			"effectLifespan": 	'EC0',
			"property": 		'EC1',
			"value": 			'EC2',
			"visibleLifespan": 	'EC3'
		},
		
		PlayerAction: {
			'boardClicked' :  	'PA0'
		},

		PlayerProperties: {
			'accel': 			'PP0',
			'attack': 			'PP1',
			'defence': 			'PP3',
			'elasticity': 		'PP4',
			'friction': 		'PP5',
			'health': 			'PP6',
			'mass': 			'PP7',
			'speed': 			'PP8'
		},
		
		Hazard: {
			"blackHole":		'H0',
			"spikeBall": 		'H1'
		}
	});
});


