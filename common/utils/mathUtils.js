define(function(){
	function Vector(x, y) {
		this.x = x;
	    this.y = y;

	    this.addVector = function(vec){
	    	this.x += vec.x;
	    	this.y += vec.y;
	    }

	    this.calc2PointVector = function(start, end){
	    	var newVec = new Vector((start.x - end.x)*-1, (start.y - end.y)*-1);
	    	return newVec.normalize(); 
	    }

	    this.dot = function(v) { return this.x * v.x + this.y * v.y; }

		this.length = function() { return Math.sqrt(this.x * this.x + this.y * this.y); }

		this.normalize = function() {
			var s = 1 / this.length();
			this.x *= s;
			this.y *= s;
			return this;
		}

		this.multiply = function(s) { return new Vector(this.x * s, this.y * s); }

		this.tx = function(v) {
		  	this.x += Math.round(v.x*100)/100;
		  	this.y += Math.round(v.y*100)/100;
		  	return this;
		}

		this.toJSON = function(){ return { x: this.x, y: this.y }; }
	}

	return CJ.namespace("Utils.Math", {
		
		Vector: Vector,

		distanceBetween: function (p1, p2){
			return Math.pow((p2.getX() - p1.getX()), 2) + Math.pow((p2.getY() - p1.getY()), 2)
		},
		
		circleIntersectsRect: function(circle, rect){
			
		},
		
		rectIntersectsRect: function(r1, r2){
			
		}
	})
});
