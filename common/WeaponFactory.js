define([
    'MathUtils'
],
function(MathUtils){
	var schematics = {
		'bullet': {
			damage: 5,
			speed: 30,
			mobility: 'straight'
		}
	}

    /* draw functions */
    function drawBullet(ctx){
		ctx.save();
		ctx.fillStyle = this.getColor();
		ctx.beginPath();
		ctx.arc(this.p.x, this.p.y, 5, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.restore();
    }

    function getDrawFunction(type){
    	return drawBullet;

    }

    /* movement functions */
    function moveFollow(target){}

    function moveStationary(){}

    function moveThrown(){}

    function moveStraight(){
    	this.p.x += this.v.x * this.speed;
    	this.p.y += this.v.y * this.speed;
    }

    function getMoveFunction(moveType){
    	switch(moveType){
    		case "follow": return moveFollow;
    		case "stationary": return moveStationary;
    		case "straight": return moveStraight;
    		case "thrown": return moveThrown;
    	}
    }

    /* damage functions */
    function getDamage(pos){
    	if(!this.aoe) return this.damage;
    }


3013675967
    function Weapon(config){
        if(!config) return;//throw 'Cant create Weapon from invalid config';

    	var weaponSchematic = schematics[config.type];
    	var r = 255, g = 0, b = 0, a = 1;

    	this.id = config.id || '';
    	this.p = new MathUtils.Vector(config.p.x || 0, config.p.y || 0);
    	this.v = new MathUtils.Vector(config.v.x || 0, config.v.y ||0);
    	this.aoe = weaponSchematic.aoe || 0;
    	this.damage = weaponSchematic.damage || 0;
    	this.rof = weaponSchematic.rof || 0;
    	this.speed = weaponSchematic.speed || 0;
    	
    	this.damage = getDamage(config.damage, config.aoe);	
    	this.move = getMoveFunction(weaponSchematic.mobility);
    	this.draw = getDrawFunction(config.type);

    	this.getColor = function(){ return 'rgba('+ r +', '+ g + ', ' + b + ', ' + a + ')'; }
    }

    Weapon.prototype.process = function(){}

    console.log('End Weapon Constructor with %j', Weapon);  

    return CJ.namespace('Factories.WeaponFactory', Weapon);
});