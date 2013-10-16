define(function(){
	var msgQueue = {};
	return CJ.namespace('EventBus', {
		on: function(eventName, fn){
			if(!eventName || !fn) throw "Invalid Parameter passed to ebUtils.on";

			if(!msgQueue[eventName]) msgQueue[eventName] = [];
			msgQueue[eventName].push(fn);
		},

		off: function(eventName, fn){

		},

		fire: function(eventName, data){
			_.each(msgQueue[eventName], function(callback){
				callback();
			})
		}
	});
});
