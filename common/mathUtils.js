(function(exports){
	//****** Vector *******//
	exports.Vector = function(x, y) {
		console.log('in vector constructor')
	    this.x = x;
	    this.y = y;
	}
	
	exports.Vector.prototype.dot = function (v) {
	    return this.x * v.x + this.y * v.y;
	};
	
	exports.Vector.prototype.length = function() {
	    return Math.sqrt(this.x * this.x + this.y * this.y);
	};
	  
	exports.Vector.prototype.normalize = function() {
		var s = 1 / this.length();
		this.x *= s;
		this.y *= s;
		return this;
	};
	
	exports.Vector.prototype.multiply = function(s) {
	  	return new exports.Vector(this.x * s, this.y * s);
	};
	
	exports.Vector.prototype.tx = function(v) {
	  	this.x += Math.round(v.x*100)/100;
	  	this.y += Math.round(v.y*100)/100;
	  	return this;
	};
	
	//***** End Vector *****//

	exports.distanceBetween = function (p1, p2){
		return Math.pow((p2.getX() - p1.getX()), 2) + Math.pow((p2.getY() - p1.getY()), 2)
	}
	
	exports.circleIntersectsRect = function(circle, rect){
		
	}
	
	exports.rectIntersectsRect = function(r1, r2){
		
	}
	
})(typeof exports === 'undefined'? this['MathUtils'] = {} : exports);
