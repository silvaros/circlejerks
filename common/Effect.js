(function(exports){
	exports.constructor = function(config){
		var defaultDuration = 5000; 
		var defaultVisibleLifespan = 5000; 
		var defaultRadius = 4;
	
		var type = config.type || 'power-up'; 
		var cumulative = config.cumulative || true;
		var radius = config.radius || defaultRadius;
		var duration = config.duration || defaultDuration;
		var value = config.value || 0;
		var property = config.property || '';
		var r = config.r == undefined ? 255 : config.r;
		var g = config.g == undefined ? 255 : config.g;
		var b = config.b == undefined ? 255 : config.b;
		var a = config.a == undefined ? 1 : config.a;
		var visibleLifeSpan = config.visibleLifespan || defaultVisibleLifespan;
		var timer = 0;
		
		this.p = new MathUtils.Vector(0, 0);	// position
		this.id = 'effect' + Math.floor(Math.random()*10000);
		 
		this.draw = function(){
			var ctx = game.getContext();
			ctx.save();
			ctx.fillStyle = this.getColor();
			ctx.beginPath();
			ctx.arc(this.p.x, this.p.y, radius, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.restore();
		}
	
		this.getColor = function(){
			a = 1 - (timer/effectLifespan);
			return 'rgba('+ r +', '+ g + ', ' + b + ', ' + a + ')';
		}		
		this.isCumulative = function(){ return cumulative;}
		this.getType = function(){ return type;}
		this.getValue = function(){return value;}
		this.getDuration = function(){return duration;}
		this.getProperty = function(){return property;}
		this.getRadius = function(){return radius;}
		this.getX = function(){	return this.p.x; }
		this.getY = function(){	return this.p.y; }

		this.incrementTimer = function(increment){
			timer += increment;
		}
	
		this.process = function(){
			this.incrementTimer()
		}
	
		this.shouldRemove = function(){
			return (timer >= visibleLifeSpan);
		}
	}
})(typeof exports === 'undefined'? window.CJ.Effect = {} : exports);