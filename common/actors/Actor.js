define([
	'MathUtils', 
	'Enums'
], function(MathUtils, Enums) {
	function Actor(config){
		if(!config) config = {};

		var id = config.id || '';

		this.radius = config.radius || 14;
		this.color = {
			r: config.r == undefined ? 0 : config.r,
			g: config.g == undefined ? 0 : config.g,
			b: config.b == undefined ? 255 : config.b,
			a: config.a == undefined ? 1 : config.a,
			toString: function(){
				return 'rgba('+ this.r +', '+ this.g + ', ' + this.b + ', ' + this.	a + ')';
			},
			set: function(colorConfig){
				this.r = colorConfig.r || this.r;
				this.g = colorConfig.g || this.g;
				this.b = colorConfig.b || this.b;
				this.a = colorConfig.a || this.a;
			}
		}

		this.properties = {};
		this.properties[Enums.PlayerProperties.accel]		= {value: 0, nominal: 0, min: -10, max:10};
		this.properties[Enums.PlayerProperties.speed]		= {value: 0, nominal: 0, min: 0, max:15 };
		this.properties[Enums.PlayerProperties.mass]		= {value: 6, nominal: 6, min: 1, max:25};
		this.properties[Enums.PlayerProperties.friction]	= {value: .2, nominal: .2, min: 0, max:1};
		this.properties[Enums.PlayerProperties.elasticity]	= {value: 1, nominal: 1, min: 1, max:1};

		// set accel value
		this.properties[Enums.PlayerProperties.accel].value = 
			Math.round( 5/ this.properties[Enums.PlayerProperties.mass].value*100 )/100
		

		//TODO: 							 V ??
		var initialX = config.p ? config.p.x || 0 : 0;
		var initialY = config.p ? config.p.y || 0 : 0;

		this.draw = function(ctx){
			ctx.save();
			ctx.fillStyle = this.color.toString();
			ctx.beginPath();
			ctx.arc(this.p.x, this.p.y, this.radius, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.restore();
		}
		
		this.p = new MathUtils.Vector(initialX, initialY); 
		this.v = new MathUtils.Vector(0, 0);	
		
		this.getId = function(){ return id; }
		this.getNextCoords = function(){
			return {x: Math.floor(this.p.x + this.v.x), y: Math.floor(this.p.y + this.v.y)}
		}
		this.getPosition = function(){ return this.p; }
		this.getRadius = function(){ return this.radius; }
		this.getX = function(){	return this.p.x; }
		this.getY = function(){	return this.p.y; }

		this.getPropertyValue = function(prop, aspect){
			if(aspect == 'value' || !aspect){
				var property = this.properties[prop];
				if(!property) return;
				//only send out values withing limits on get
				var val = property.value;
				if(val > property.max) val = property.max;
				else if (val < property.min) val = property.min;
				return val;
			}
			else return this.properties[prop][aspect];
		}			
	}

	return CJ.namespace('Actor', Actor);
});