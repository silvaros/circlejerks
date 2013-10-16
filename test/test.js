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
define(["client/eventBus"],
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