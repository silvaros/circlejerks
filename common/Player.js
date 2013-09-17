define([
	//'WeaponFactory',
	'Utils', 
	'MathUtils', 
	'Enums'
],
function(/* WeaponFactory,*/ Utils, MathUtils, Enums){
	function Player(config){
		if(!config) config = {};

		var id = config.id || '';
		var radius = config.radius || 14;
		var r = config.r == undefined ? 0 : config.r;
		var g = config.g == undefined ? 0 : config.g;
		var b = config.b == undefined ? 255 : config.b;
		var a = config.a == undefined ? 1 : config.a;
		
		var effects = {'pos' : {}, 'neg': {}};
		var properties = {};
		properties[Enums.PlayerProperties.accel]= 		{value: 0, nominal: 0, min: -10, max:10};
		properties[Enums.PlayerProperties.attack]=	 	{value: 10, nominal:10, min: 0, max:100};
		properties[Enums.PlayerProperties.defence]=		{value: 10, nominal: 10, min: 0, max:100};
		properties[Enums.PlayerProperties.speed]= 		{value: 0, nominal: 0, min: 0, max:15 };
		properties[Enums.PlayerProperties.health]= 		{value: 0, nominal: 50, min: 0, max:100};
		properties[Enums.PlayerProperties.mass]= 		{value: 6, nominal: 6, min: 1, max:25};
		properties[Enums.PlayerProperties.friction]= 	{value: .2, nominal: .2, min: 0, max:1};
		properties[Enums.PlayerProperties.elasticity]=	{value: 1, nominal: 1, min: 1, max:1};

		// set accel value
		properties[Enums.PlayerProperties.accel].value = 
			Math.round( 5/ properties[Enums.PlayerProperties.mass].value*100 )/100
		
		var initialX = config.p ? config.p.x || 0 : 0;
		var initialY = config.p ? config.p.y || 0 : 0;
		this.p = new MathUtils.Vector(initialX, initialY); 
		this.v = new MathUtils.Vector(0, 0);	
		this.weapons = new Utils.JsDictionary();
		this.selectedWeapon = 'bullet';
		
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
		
		this.addWeapon = function(name){
			if(!this.weapons.get(name)) this.weapons.add(name, 0);
			this.weapons.set(name, this.weapons.get(name)+1);
		}

		this.fireWeapon = function(){
			//var count = weapons.get(selectedWeapon);
			//if(count > 0)
		}

		this.getPropertyValue = function(prop, aspect){
			if(aspect == 'value' || !aspect){
				var property = properties[prop];
				if(!property) return;
				//only send out values withing limits on get
				var val = property.value;
				if(val > property.max) val = property.max;
				else if (val < property.min) val = property.min;
				return val;
			}

			else {
				return properties[prop][aspect];
			}
		}			
			
		this.draw = function(ctx){
			ctx.save();
			ctx.fillStyle = this.getColor();
			ctx.beginPath();
			ctx.arc(this.p.x, this.p.y, radius, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.restore();
		}
		
		this.getColor = function(){
			return 'rgba('+ r +', '+ g + ', ' + b + ', ' + a + ')';
		}
		
		this.getPosition = function(){ return this.p; }
		this.getRadius = function(){ return radius; }
		this.getX = function(){	return this.p.x; }
		this.getY = function(){	return this.p.y; }

		this.move = function(bounds){
			this.v.y = Math.round(this.v.y*100)/100;
			this.v.x = Math.round(this.v.x*100)/100;
						
			if(this.v.x != 0 || this.v.y != 0){
				var newX = Math.floor(this.p.x + this.v.x);
				var newY = Math.floor(this.p.y + this.v.y);
			
				var leftMost = bounds.left + radius;
				var rightMost = bounds.right - radius;
				var topMost = bounds.top + radius;				
				var bottomMost = bounds.bottom - radius;

				// keep the this on the board
				if(newX < leftMost) this.p.x = leftMost;
				else if(newX > rightMost) this.p.x = rightMost;
				else this.p.x = newX;

				if(newY < topMost) this.p.y = topMost;
				else if(newY > bottomMost) this.p.y = bottomMost;
				else this.p.y = newY;
			}
		}
	
		this.process = function(){
			// simulate friction
			var friction = properties[Enums.PlayerProperties.friction].value;
			if(this.v.y < 0){
				if(this.v.y + friction > 0) this.v.y = 0;
				else this.v.y += friction;
			}
			else if(this.v.y > 0){
				if(this.v.y - friction < 0) this.v.y = 0;
				else this.v.y -= friction;
			}
			
			if(this.v.x < 0){
				if(this.v.x + friction > 0) this.v.x = 0;
				else this.v.x += friction;
			}
			else if(this.v.x > 0){
				if(this.v.x - friction < 0) this.v.x = 0;
				else this.v.x -= friction;
			}	
		}

		this.setColor = function(red,green,blue,alpha){
			r = red || r;
			g = green || g;
			b = blue || b;
			a = alpha || a;
		}

		this.toJSON = function(){
			return {
				'id': id,
				'p': this.p.toJSON(),
				'v': this.v.toJSON()
			}
		}
	}

	return CJ.namespace('Actors.Player', Player);
});
