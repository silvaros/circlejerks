CircleJerks.EventBus = (function(){
	var msgQueue = {}

	return {
		on: function(eventName, fn){
			if(!eventName || !fn) throw "Invalid Parameter passed to ebUtils.on";

			if(!msgQueue[eventName]) msgQueue[eventName] = [];
			msgQueue[eventName].push(fn);
		},

		off: function(eventName, fn){

		},

		trigger: function(eventName, data){
			_.each(msgQueue[eventName], function(callback){
				callback();
			})
		}
	}
})();