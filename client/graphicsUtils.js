define(function(){
	var canvasHeight, canvasWidth, heightScale = 1, widthScale = 1;
	var baseHeight = 720, baseWidth = 1280, hToWRatio = 9/16;
	var minHeight = 600, minWidth = 800
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
		heightScale = height == undefined ? 1 : size.height / baseHeight;
		widthScale = width == undefined ? 1 : size.width / baseWidth;
	} 

	return CJ.namespace('Utils.Graphics', {
		onCanvasSizeChanged: function(sizeOrWidth, height){			
			var size  = parseSizeParams(sizeOrWidth, height);
			canvasWidth = size.width || canvasWidth || baseWidth ;
			canvasHeight = size.height || canvasHeight || baseHeight;

			// check size bounds
			if(canvasHeight < minHeight) canvasHeight = minHeight;
			if(canvasWidth < minWidth) canvasWidth = minWidth;

			if(keepRatio){}

			setScaleRatio(canvasWidth, canvasHeight);
		},

		getScaledSize: function(){}
	});
});