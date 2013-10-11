define([
	'Enums',
	'MathUtils'
],
function(Enums, MathUtils){
	var ns = 'Utils';
	return CJ.namespace(ns, {
		/* This returns the rectangle that the passed object 
		   will occupy given its position and movement vector*/
		getVectorBox: function(actor){
			var nextCoords = actor.getNextCoords();
			var curCoords = actor.p.toJSON();

			var o=0;
		},

		applyPlayerCollision: function(p1, p2){
			var dt, mT, v1, v2, cr, sm,
		      dn = new MathUtils.Vector(p1.getX() - p2.getX(), p1.getY() - p2.getY()),
		      dx = dn.length(); // pre-normalized magnitude
			  
			var p1Mass = p1.getPropertyValue(Enums.PlayerProperties.mass);
			var p2Mass = p2.getPropertyValue(Enums.PlayerProperties.mass);
			// sum the masses
			sm = p1Mass + p2Mass;
			//normalize the collision vector 
			dn.normalize();
			//get its tangential
			dt = new MathUtils.Vector(dn.y, -dn.x); 
				      
			// avoid double collisions by "un-deforming" balls (larger mass == less tx)
			// this is susceptible to rounding errors, "jiggle" behavior and anti-gravity
			// suspension of the object get into a strange state
			mT = dn.multiply(p1.getRadius() + p2.getRadius() - dx);
			
			p1.p.tx(mT.multiply(p2Mass / sm));
			p2.p.tx(mT.multiply(-p1Mass / sm));
			
			// this interaction is strange, as the CR describes more than just
			// the ball's bounce properties, it describes the level of conservation
			// observed in a collision and to be "true" needs to describe, rigidity, 
			// elasticity, level of energy lost to deformation or adhesion, and crazy
			// values (such as cr > 1 or cr < 0) for stange edge cases obviously not
			// handled here (see: http://en.wikipedia.org/wiki/Coefficient_of_restitution)
			// for now assume the ball with the least amount of elasticity describes the
			// collision as a whole:
			cr = 1;//Math.min(
				//p1.getPropertyValue(Enums.PlayerProperties.elasticity),
				//p2.getPropertyValue(Enums.PlayerProperties.elasticity)
			//);
			
			// cache the magnitude of the applicable component of the relevant velocity
			v1 = dn.multiply(p1.v.dot(dn)).length();
			v2 = dn.multiply(p2.v.dot(dn)).length(); 
			
			// maintain the unapplicatble component of the relevant velocity
			// then apply the formula for inelastic collisions
			p1.v = dt.multiply(p1.v.dot(dt));
			p1.v.tx(dn.multiply((cr * p2Mass * (v2 - v1) + p1Mass * v1 + p2Mass * v2) / sm));
			
			// do this once for each object, since we are assuming collide will be called 
			// only once per "frame" and its also more effiecient for calculation cacheing 
			// purposes
			p2.v = dt.multiply(p2.v.dot(dt));
			p2.v.tx(dn.multiply(-(cr * p1Mass * (v1 - v2) + p2Mass * v2 + p1Mass * v1) / sm));
		},
		
		copyTo: function(toObj, fromObj, preventIdCopy){
			// return only the properties that have changed
			var changedProperties;
			for(var prop in fromObj){
				if(typeof fromObj[prop] == "function") continue;
				
				if(typeof fromObj[prop] == "object"){
					if(!toObj[prop]) toObj[prop] = {};
					var copyResult = this.copyTo(toObj[prop],fromObj[prop], preventIdCopy);
					if(copyResult){
						if(!changedProperties) changedProperties = {};
						changedProperties[prop] = copyResult;
					}
				}
				else if(toObj[prop] != fromObj[prop] || (prop == "id" && preventIdCopy !== true)){
					if(!changedProperties) changedProperties = {};
					changedProperties[prop] = fromObj[prop];
					toObj[prop] = fromObj[prop];
				}
			}
			
			return changedProperties;
		},
		
		//****** Dictionary *******//
		JsDictionary: function() {
			var data = {};
		
			this.add = function(key, value) {
				if (key == undefined) return;
				data[key] = value;
			}
		
			this.clear = function() {
				for (var key in data) {
					delete data[key];
				}
			}
			
			this.containsKey = function(key) {
				if (key != undefined) {
					for (var _key in data) {
						if (_key === key) return true;
					}
				}
				return false;
			}
			
			this.get = function(key) {
				var returnVal;
				if(key != undefined) returnVal = data[key];
				return returnVal;
			}
		
			this.getKeys = function() {
				var keys = [], key;
				for(key in data){keys.push(key);}
				return keys;
			}
		
			this.getValues = function() {
				var items = [], key;
				for(key in data){
					items.push(data[key]);
				}
				return items;
			};
		
			this.length = function() {
				return this.getKeys().length;
			}
			
			this.remove = function(key) {
				if(key != undefined) delete data[key];
			}

			this.set = function(key, val){
				data[key] = val;
			}

			this.toJSON = function(){
				var obj = {};
				for(var id in data){
					obj[id] = data[id].toJSON();
				}
				return obj;
			}
		}
		//**** End Dictionary *****//	
	})
})
