var test = (function(){
	return {
		testInheritance: function(){
			function a(){
				this.a = 2;
				this.b = 3;
				this.aa = function(){ 
					console.log('this.a = ' + this.a + " this.b = " +  this.b);
				}
			}

			function b(){
				
				this.b = 111;
				this.getX = function(){return this.b}

				a.call(this, 112);
			}

			b.prototype = new a();
			b.prototype.constructor = b;
				
			var bb = new b();
			console.log("bb.a = : " + bb.a);
			bb.aa();
			console.log(bb.getX)
			console.log(bb.getX())



		}
	}

})();