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

	function setScaleRatio(size){
		heightScale = size.height == undefined ? 1 : size.height / baseHeight;
		widthScale = size.width == undefined ? 1 : size.width / baseWidth;

		if(keepRatio){
			//if the height is larger than it shoud be
			if(heightScale > widthScale){
				size.height = baseHeight * widthScale;
				heightScale = widthScale;
			}
			else if(widthScale > heightScale){
				size.width = baseWidth * heightScale;
				widthScale = heightScale;	
			}
		}

		return size;
	} 

	return CJ.namespace('Utils.Graphics', {
		updateCanvasSize: function(sizeOrWidth, height){			
			var size  = parseSizeParams(sizeOrWidth, height);
			size.width = size.width || canvasWidth || baseWidth ;
			size.height = size.height || canvasHeight || baseHeight;

			// check size bounds
			if(size.height < minHeight) size.height = minHeight;
			if(size.width < minWidth) size.width = minWidth;

			size = setScaleRatio(size); 

			canvasWidth = size.width;
			canvasHeight = size.height;
		},

		getScaledSize: function(){}
	});
});