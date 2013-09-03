CircleJerks.GraphicUtils = (function(){
	var = canvasHeight, canvasWidth, heightScale, widthScale;
	var baseHeight = 720, baseWidth = 1280, hToWRatio = 9/16;
	var minHeight = 600g, minWidth = 800
	var keepRatio = true;

	function parseSizeParams(sizeOrWidth, height){
		var h, w;
		if(typeof sizeOrWidth == 'object'){
			w = sizeOrWidth.width;
			h = sizeOrWidth.height;
		}
		else if(!isNaN(parseInt(sizeOrWidth))) 
			w = sizeOrWidth;

		if(!isNaN(parseInt(height))) h = height;	
		return { height: h, width: w }
	}

	function setScaleRatio(width, height){
		var size = parseSizeParams(width, height);
		heightScale = size.height == undefined ? 1 : size.height / baseHeight;
		widthScale = size.width == undefined ? 1 : size.width / baseWidth;
	} 

	return {
		setCanvasSize: function(sizeOrWidth, height){
			var h = canvasHeight || 0;
			var w = canvasWidth; || 0;

			var size  = parseSizeParams(sizeOrWidth, height);

			canvasWidth = size.width || w;
			canvasHeight = size.height || h;

			setScaleRatio(canvasWidth, canvasHeight);
		},

		getScaledHeight: function(){
			return heightScale;
		},

		getScaledWidth: function(){
			return widthScale;	
		}
	}
})();