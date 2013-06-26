(function(exports){
	Enums = typeof Enums != "undefined" ? Enums : require('../common/Enums');
	Effect = typeof Effect != "undefined" ? Effect : require('../common/Effect').constructor;

	var effectConfigs = {};
	effectConfigs[Enums.PlayerProperties.attack] = {'g':0, 'value':5, 'p': 'attack'}
	effectConfigs[Enums.PlayerProperties.defence] = {'b':0, 'r':0, 'value':5, 'p': 'defence'}
	effectConfigs[Enums.PlayerProperties.health] = {'r':0, 'duration':0, 'value':5,'p': 'health'}
	effectConfigs[Enums.PlayerProperties.speed] = {'b': 0, 'v':5, 'p': 'speed'}
	
	/*********** Effects ***********/
	exports.createEffectFromConfig = function(config){
		if(!config) return;
		return new Effect(config);
	}

	exports.createEffectForProperty = function(effectStr){
		var config = effectConfigs[effectStr];
		return new Effect(config);
	}

	exports.createRandomEffect = function(){
		// var rand = Math.floor(Math.random*Enums.PlayerProperties.length);
		// var config = properties[rand];
		// if(!config) return;
		// return new Effect(config);
	}
	/********* End Effects *********/
	
})(typeof exports === 'undefined'? this['ObjectFactory'] = {} : exports);
