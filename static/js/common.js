function render2(primaryColor, secondaryColor, containerId, filename, highlight="ffffff", background="000000") {
	var layer = [ //creates the <canvas> DOMs
		createLayer(WIDTH, HEIGHT),
		createLayer(WIDTH, HEIGHT),
		createLayer(WIDTH, HEIGHT),
		createLayer(WIDTH, HEIGHT)
	];
	layer[0].drawImage(IMAGES.primaryColor.obj, 0, 0);
	applyColorMask(layer[0], primaryColor);

	layer[1].drawImage(IMAGES.secondaryColor.obj, 0, 0);
	applyColorMask(layer[1], secondaryColor);

    layer[2].drawImage(IMAGES.highlight.obj, 0, 0);
	applyColorMask(layer[2], highlight);

	layer[0].drawImage(layer[1].canvas, 0, 0);
	layer[0].drawImage(layer[2].canvas, 0, 0);

    let workingLayer = 0;
    if (hasBackground) {
        layer[3].drawImage(IMAGES.background.obj, 0, 0);
        applyColorMask(layer[3], background);
        layer[3].drawImage(layer[0].canvas, 0, 0);
        workingLayer = 3;
    }

    let $canvas = $(layer[workingLayer].canvas);
	let src = $canvas[0].toDataURL();
	let img = document.createElement("image");
	img.setAttribute("src", src);
	img.setAttribute("class", "candyImg");
	img.setAttribute("title", filename)

	container = document.getElementById(containerId)
	container.innerHTML = img.outerHTML;
	container.setAttribute("href", src);
	container.setAttribute("download", filename);
}

function render(record, targetSelector) {
	var $wrapper = $('<div>', { class : 'pkmn' });
	var layer = [
		createLayer(WIDTH, HEIGHT),
		createLayer(WIDTH, HEIGHT),
		createLayer(WIDTH, HEIGHT)
	];

	layer[0].drawImage(IMAGES.primaryColor.obj, 0, 0);
	applyColorMask(layer[0], record.primaryColor);
	
	layer[1].drawImage(IMAGES.secondaryColor.obj, 0, 0);
	applyColorMask(layer[1], record.secondaryColor);
	
	layer[0].drawImage(layer[1].canvas, 0, 0);
	layer[0].drawImage(IMAGES.highlight.obj, 0, 0);

	var $canvas = $(layer[0].canvas);
	$canvas.attr('title', 'Right-click to save image');
	$canvas.data({
		'cid'  : record.id,
		'name' : record.pokemon
	});

	$wrapper.append($canvas).append($('<p>', {
		text : record.pokemon.toUpperCase() + ' CANDY',
		class : 'pkmn-name'
	})).appendTo(targetSelector);
}

function loadImages(IMAGES, callback) {
	$.each(IMAGES, function(index, image) {
		loadImage(image, callback);
	});
}

function loadImage(image, callback) {
	image.obj = new Image();
	image.obj.onload = function(e) {
		if (IMAGESLoaded++ >= Object.keys(IMAGES).length - 1) {
			callback();
		}
	};
	image.obj.src = image.src;
}

function createLayer(width, height) {
	var layer = document.createElement('canvas');
	layer.className = 'layer';
	layer.width = width;
	layer.height = height || width;
	return layer.getContext('2d');
}

function applyColorMask(ctx, color) {
	if (color.indexOf('#') !== 0) color = '#' + color;
	var rgba = hexToRgbA(color);
	var imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
	for (var byte = 0; byte < imgData.data.length; byte += 4) {
		for (var p = 0; p < 4; p++) {
			imgData.data[byte + p] = rgba[p] * (imgData.data[byte + p] / 255);
		}
	}
	ctx.putImageData(imgData, 0, 0);
}

function saveCanvas(canvas) {
	var $canvas = $(canvas);
	var fname = $canvas.data('name') + '_candy';
	saveAsPNG(canvas, fname);
}

function hexToRgbA(hex){
	if (/^#([A-F0-9]{3}){1,2}$/i.test(hex)) {
		var c = hex.substring(1).split('');
		if (c.length === 3){
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = parseInt(c.join(''), 16);
		return [(c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF, 0xFF];
	}
}

// http://stackoverflow.com/a/34707543/1762224
function saveAsPNG(image, filename) { // No IE <11 support. Chrome URL bug for large images may crash
	var anchorElement, event, blob;
	function image2Canvas(image) {  // converts an image to canvas
		function createCanvas(width, height) {  // creates a canvas of width height
			var can = document.createElement('canvas');
			can.width = width;
			can.height = height;
			return can;
		};
		var newImage = createCanvas(img.width, img.height); // create new image
		newImage.ctx = newImage.getContext('2d');  // get image context
		newImage.ctx.drawImage(image, 0, 0); // draw the image onto the canvas
		return newImage;  // return the new image
	}
	if (image.toDataURL === undefined){    // does the image have the toDataURL function
		image = image2Canvas(image);  // No then convert to canvas
	}
	// if msToBlob and msSaveBlob then use them to save. IE >= 10
	// As suggested by Kaiido 
	if(image.msToBlob !== undefined && navigator.msSaveBlob !== undefined){ 
	   blob = image.msToBlob(); 
	   navigator.msSaveBlob(blob, filename + '.png'); 
	   return;
	}
	anchorElement = document.createElement('a');  // Create a download link
	anchorElement.href = image.toDataURL();   // attach the image data URL
	// check for download attribute
	if (anchorElement.download !== undefined) {
		anchorElement.download = filename + '.png';  // set the download filename
		if (typeof MouseEvent === 'function') {   // does the browser support the object MouseEvent
			event = new MouseEvent(   // yes create a new mouse click event
				'click', {
					view        : window,
					bubbles     : true,
					cancelable  : true,
					ctrlKey     : false,
					altKey      : false,
					shiftKey    : false,
					metaKey     : false,
					button      : 0,
					buttons     : 1,
				}
			);
			anchorElement.dispatchEvent(event); // simulate a click on the download link.
		} else if (anchorElement.fireEvent) {
			// if no MouseEvent object try fireEvent 
			anchorElement.fireEvent('onclick');
		}
	}
}

/* ================================================================== *
 * Form
 * ================================================================== */
function retrieveFormFields(form) {
	var params = {};
	for (var i = 0; i < form.elements.length; i++) {
		var formElement = form.elements[i];
		switch (formElement.tagName) {
			case 'INPUT':
				if (formElement.getAttribute('type') !== 'button') {
					applyField(params, formElement);
				}
				break;
			case 'TEXTAREA':
				applyField(params, formElement);
				break;
		}
	}
	return params;
}

function applyField(params, formElement) {
	var fieldName = kebabCaseToMixedCase(formElement.name);
	var fieldValue = formElement.value;
	if (params[fieldName] != null) {
		var val = params[fieldName];
		if (Array.isArray(params[fieldName])) {
			params[fieldName].push(fieldValue);
		} else {
			params[fieldName] = [params[fieldName], fieldValue];
		}
	} else {
		params[fieldName] = fieldValue;
	}
}

// http://stackoverflow.com/questions/6660977
function kebabCaseToMixedCase(str) {
	return str.replace(/-([a-z])/g, function(g) {
		return g[1].toUpperCase();
	});
}
