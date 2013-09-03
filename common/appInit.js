
console.log('--------in app init----------------------')
console.log('-------- requirejs = %j---------', requirejs)
requirejs.config({
	waitSeconds: 0,
    nodeRequire: require,
	baseUrl: './common',
	paths: {
        Player: 'Player',
        GameEngine: 'GameEngine',
        Utils: 'utils',
        MathUtils: 'mathUtils',
        Enums: 'Enums',
        GameClient: '../client/game-client',
        jquery: '../lib/jquery'	,
        requirejs: '../lib/require'
	}
});

define([
	'jquery'
],
function( $, _ ){
	console.log($)
	// root of data structure
	CJ = (function(){
		function CircleJerks(){ 
			this.namespace = function(ns, config) {
				console.log('Entered namespace, ns = %s', ns);
				console.log('Entered namespace, config = %j', JSON.stringify(config));
				console.log(' ');
				 var obj = this, tokens = ns.split("."), token;
				console.log(" tokens.length -" + tokens.length);
				while(tokens.length > 0) {
					token = tokens.shift();
					console.log('tokens count after shift: %s', tokens.length);
					if(!obj[token]) obj[token] = {};

					if(tokens.length == 0){
						switch(typeof config){
						case 'function':
							obj[token] = 'a'//config;
							break;
						case 'object': 
							obj[token] = $.extend(obj[token], config);
							break;
						}
					}

					obj = obj[token];
				}	

				var test = new obj.Vector();
				console.log('returning ns ('+ ns +') as : %j', JSON.stringify(obj.Vector));

				return obj;
			}
	 
			return this; 
		}
		return new CircleJerks();
	})();
});
