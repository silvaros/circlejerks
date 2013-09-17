define([
	'lodash'
],
function( _ ){
	console.log('app init args, %j', JSON.stringify(arguments));
	// root of data structure
	CJ = _.extend({}, {
		namespace: function(ns, config) {
			//console.log('Entered namespace, ns = %s', ns);
			//console.log('Entered namespace, config = %j', config);
			var obj = this, tokens = ns.split("."), token;
			//console.log(" tokens.length -" + tokens.length);
			while(tokens.length > 0) {
				token = tokens.shift();
			//console.log('token = %s', token);
				//console.log('tokens count after shift: %s', tokens.length);
				if(!obj[token]) obj[token] = {};
				if(tokens.length == 0){
			//console.log('checking type');
					switch(typeof config){
					case 'function':
			//console.log('config is function')
						obj[token] = config;
			//console.log('obj[token] is %j', JSON.stringify(obj[token]))
						break;
					case 'object': 
			//console.log('config is object')
						obj[token] = _.extend(obj[token], config);
						break;
					}
				}

				obj = obj[token];
			}	

			//console.log('returning ns ('+ ns +') as : %j', JSON.stringify(obj));
			//console.log(' ');
			
			return obj;
		},

		require: function(moduleNames, calBkFn){
			// Set up appropriately for the environment.
			if (typeof exports !== 'undefined') {
				// Node/CommonJS, 
				calBkFn(
					require('jquery-deferred'),
					require("underscore"),
					require('sinon'),
					require('should'),
					require('../sebastian').flow);
			} 
			else if (typeof define === 'function' && define.amd) {
				// AMD
				define(['jquery', 'lodash'], function($, _) {
					calBkFn($, _); 
				});
			}
		}
	});

	return CJ;
});
