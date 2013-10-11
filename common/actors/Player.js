define([
	'Utils', 
	'MathUtils', 
	'Enums',
	'WeaponFactory',
	'Actor'
],
function(Utils, MathUtils, Enums, Weapon, Actor){
	function Player(config){
		Actor.call(this, config);
		
		if(!config) config = {};

		var effects = {'pos' : {}, 'neg': {}};
		this.properties[Enums.PlayerProperties.attack]	= {value: 10, nominal:10, min: 0, max:100};
		this.properties[Enums.PlayerProperties.defence]	= {value: 10, nominal: 10, min: 0, max:100};
		this.properties[Enums.PlayerProperties.health]	= {value: 0, nominal: 50, min: 0, max:100};
		
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

		this.move = function(bounds){
			this.v.y = Math.round(this.v.y*100)/100;
			this.v.x = Math.round(this.v.x*100)/100;
						
			var vBox = Utils.getVectorBox(this);

			if(this.v.x != 0 || this.v.y != 0){
				var newX = Math.floor(this.p.x + this.v.x);
				var newY = Math.floor(this.p.y + this.v.y);
			
				var leftMost = bounds.left + this.radius;
				var rightMost = bounds.right - this.radius;
				var topMost = bounds.top + this.radius;				
				var bottomMost = bounds.bottom - this.radius;

				// keep the this on the board
				if(newX < leftMost){
					this.p.x = leftMost;
					//TODO: what happens when we hit the wall ???
				}
				else if(newX > rightMost){
					this.p.x = rightMost;
					//TODO: what happens when we hit the wall ???
				}
				else this.p.x = newX;

				if(newY < topMost) this.p.y = topMost;
				else if(newY > bottomMost) this.p.y = bottomMost;
				else this.p.y = newY;
			}
		}
	
		this.process = function(){
			// simulate friction
			var friction = this.properties[Enums.PlayerProperties.friction].value;
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

		this.toJSON = function(){
			return {
				'id': this.getId(),
				'p': this.p.toJSON(),
				'v': this.v.toJSON()
			}
		}
	}

	Player.prototype = Object.create(Actor);
	Player.prototype.constructor = Player;

	return CJ.namespace('Actors.Player', Player);
});
