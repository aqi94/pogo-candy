var IMAGESLoaded = 0;

$(function() {
	document.oncontextmenu = function() { return false; };
	$(document).on('mousedown', 'canvas', function(e) {
		if (e.button == 2) {
			if (e.target.nodeName.toLowerCase() === 'canvas') {
				saveCanvas(e.target);
			}
			return false; 
		}
		return true; 
	});

	//loadImages(IMAGES, () => render2(primaryColor, secondaryColor, "candy"));
	loadImages(IMAGES, () => {
	    buildSelect("pkmnSelect", "mainImg");
	    inputToRender("mainImg");
	});

//	loadImages(IMAGES, function() {
//		$.ajax({
//			url: dataUrl,
//			dataType: 'text',
//			success: function(csv) {
//				$.csv.toObjects(csv, { separator : '\t' }, onLoad);
//			}
//		});
//	});
});

function onLoad(error, records) {
	$.each(records, function(index, record) {
		render(record, '#content');
	})
}
