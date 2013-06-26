(function(exports){
	Utils = typeof Utils != "undefined" ? Utils : require('../common/utils');
	MathUtils = typeof MathUtils != "undefined" ? MathUtils : require('../common/mathUtils');
	Enums = typeof Enums != "undefined" ? Enums : require('../common/Enums');
		
	exports.constructor = function(config){
		var id = config.id || '';
		var radius = config.radius || 14;
		var position = config.p || new MathUtils.Vector(0, 0); 
		var velocity = new MathUtils.Vector(0, 0);	
		var r = config.r == undefined ? 0 : config.r;
		var g = config.g == undefined ? 0 : config.g;
		var b = config.b == undefined ? 255 : config.b;
		var a = config.a == undefined ? 1 : config.a;
		
		var effects = {'pos' : {}, 'neg': {}};
		var properties = {};
		properties[Enums.PlayerProperties.accel]= 		{value: 10, nominal: 10, min: 0, max:100};
		properties[Enums.PlayerProperties.attack]=	 	{value: 10, nominal:10, min: 0, max:100};
		properties[Enums.PlayerProperties.defence]=		{value: 10, nominal: 10, min: 0, max:100};
		properties[Enums.PlayerProperties.speed]= 		{value: 0, nominal: 10, min: 0, max:30};
		properties[Enums.PlayerProperties.health]= 		{value: 0, nominal: 50, min: 0, max:100};
		properties[Enums.PlayerProperties.mass]= 		{value: 6, nominal: 6, min: 1, max:25};
		properties[Enums.PlayerProperties.friction]= 	{value: .1, nominal: .1, min: 0, max:1};
		properties[Enums.PlayerProperties.elasticity]=	{value: 1, nominal: 1, min: 1, max:1};

		// set accel value
		properties[Enums.PlayerProperties.accel].value = 
			Math.round( 3/ properties[Enums.PlayerProperties.mass].value*100 )/100
		
		function addEffect(effect){
			var addTimer = function(effect){
				//add the timeout 
				effect.timeoutId = setTimeout(function(){
					properties[effect.getProperty()].value -= effect.getValue();
				}, effect.getDuration());
				//assign the timeout id to the effect incase we need "reset" i
			}
			
			var effectCharge = (effect.getValue() >= 0 ? 'pos' : 'neg');
			var type = effect.getType();
			// if there is not a type create it 
			if(!effects[effectCharge][type])
				effects[effectCharge][type] = new Utils.JsDictionary();
				
			// reuse type var, make it the entry object for the type
			type = effectsType[effectCharge][type];	
			var affectedProp = effect.getProperty();
			// does an effect for this property exist?
			var previousEffect = type.get(affectedProp);
			if(previousEffect){
				// if it is cululative, add the new timer and add the effect value
				if(effect.isCumulative){
					 addTimer(effect);
					 properties[affectedProp].value += effect.getValue();
				}
				else {
					//TODO:determine if the previous effect is weaker, if so 
					// let the stronger effect expire before using the weaker
					// for now we'll just "overwrite" the previous
					var diff = effect.getValue()- previousValue.getValue();
					properties[affectedProp].value += diff;
					
					clearTimeout(previousEffect.timeoutId);
					addTimer(effect);					
				}	
			}
			// if this is the only/first effect for this property
			else{
				addTimer(effect);
				properties[affectedProp].value += effect.getValue();
			}
		}
		
		function getPropertyValue(prop){
			var property = properties[prop];
			if(!property) return;
			//only send out values withing limits on get
			var val = property.value;
			if(val > property.max) val = property.max;
			else if (val < property.min) val = property.min;
			return val;
		}			
			
		this.draw = function(){
			var ctx = game.getContext();
			ctx.save();
			ctx.fillStyle = this.getColor();
			ctx.beginPath();
			ctx.arc(position.x, position.y, radius, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.restore();
		}
		
		this.getColor = function(){
			return 'rgba('+ r +', '+ g + ', ' + b + ', ' + a + ')';
		}
		
		this.getData = function(){
			return {
				'id': id,
				'p': position,
				'v': velocity
			}
		}
		this.getPosition = function(){ return position;}
		this.getRadius = function(){ return radius; }
		this.getX = function(){	return position.x; }
		this.getY = function(){	return position.y; }

		this.move = function(){
			// simulate friction
			var friction = properties[Enums.PlayerProperties.friction].value;
			if(velocity.y < 0){
				if(velocity.y + friction > 0) velocity.y = 0;
				else velocity.y += friction;
			}
			else if(velocity.y > 0){
				if(velocity.y - friction < 0) velocity.y = 0;
				else velocity.y -= friction;
			}
			
			if(velocity.x < 0){
				if(velocity.x + friction > 0) velocity.x = 0;
				else velocity.x += friction;
			}
			else if(velocity.x > 0){
				if(velocity.x - friction < 0) velocity.x = 0;
				else velocity.x -= friction;
			}	
			
			velocity.y = Math.round(velocity.y*100)/100;
			velocity.x = Math.round(velocity.x*100)/100;
			
			var newX = Math.floor(position.x + velocity.x);
			var newY = Math.floor(position.y + velocity.y);
			
			if(velocity.x != 0 || velocity.y != 0){
				var width = game.getWidth();
				var height = game.getHeight();					

				// keep the this on the board
				if(newX < radius) position.x = radius;
				else if(newX > width - radius) position.x = width - radius;
				else position.x = newX;

				if(newY < radius) position.y = radius;
				else if(newY > height - radius) position.y = height - radius;
				else position.y = newY;

				game.playerUpdated();
			}
		}
	
		this.process = function(){
			this.move();
			this.draw();
		}
		
		this.setColor = function(red,green,blue,alpha){
			r = red || r;
			g = green || g;
			b = blue || b;
			a = alpha || a;
		}
	}
})(typeof exports === 'undefined'? this['Player'] = {} : exports);
