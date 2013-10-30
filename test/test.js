
define(['b2d'], function(){
	function update(){
		world.Step(1 / 60, 10, 10);
		world.DrawDebugData();
		world.ClearForces(); 
	}

	var	b2Vec2		= Box2D.Common.Math.b2Vec2,
    	b2BodyDef	= Box2D.Dynamics.b2BodyDef,
        b2Body		= Box2D.Dynamics.b2Body,
        b2FixtureDef	= Box2D.Dynamics.b2FixtureDef,
        b2World		= Box2D.Dynamics.b2World,
		b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        world


	return {
		init: function(){
			world = new b2World(new b2Vec2(0,0), true);
			
			var fixDef = new b2FixtureDef();
			fixDef.density = 1.0;
			fixDef.friction = .5;
			fixDef.restiution = .2;
			fixDef.shape = new b2CircleShape(14);

			var bodyDef = new b2BodyDef();
			bodyDef.type = b2Body.b2_dyanmicBody;

			bodyDef.position.x = 100;
			bodyDef.position.y = 100;

			world.CreateBody(bodyDef).CreateFixture(fixDef)

			//setup debug draw
			var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
			//debugDraw.SetDrawScale(30.0);
			debugDraw.SetFillAlpha(0.5);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);

			window.setInterval(update, 1000 / 60); 
		}
	}

})

define("defaultTests", [],
function(){
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
});


/* Event bus tests*/
define('',["client/eventBus"],
function(eb){
	var tests = {
		testOnFnUsingNumSubscriptions: function(){
			var fnName = 'testOnFnUsingNumSubscriptions';
			var evtName = 'click';

			eb.on(evtName, function(){
			 return '123'
			});
			
			/*
			console.assert(eb.msgQueue[evtName] != undefined, fnName + ' failed: key assigned, but is undefined.');
			console.assert(eb.msgQueue[evtName].length == 1, fnName + ' failed: messageQueue length not 1.');
			console.assert(typeof eb.msgQueue[evtName][0] == 'function', fnName + ' failed: assigned subscription type = ' + typeof eb.msgQueue[evtName][0]);
			*/
			console.assert(eb.fire(evtName) == '123', fnName + ' failed: subscription fn did not return expected value');
		}
	}

	return {
		runAllBut: function(fnNames){
			for(testName in tests){
				// use fnNames to NOT run specific tests
				if(!fnNames || fnNames.indexOf(testName) == -1){
					// run current test
					tests[testName]();
				}
			}
		}
	}
});
