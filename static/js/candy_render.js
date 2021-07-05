import ImageMask from "./ImageMask.js";

var fileSources = {
    "candyxl": "/static/assets/images/LV40_XLCANDY_RGB_PSD.png",
    "mega": "/static/assets/images/pokemon_details_mega_candy.png",
    "large": [
        `candy_painted_base_color.png`,
        `candy_painted_secondary_color.png`,
        `candy_painted_highlight.png`,
    ].map(f => "/static/assets/images/" + f),
    "small": [
        `candy_vector_base_color.png`,
        `candy_vector_secondary_color.png`,
        `candy_vector_highlight.png`,
    ].map(f => "/static/assets/images/" + f),
};

function pkmnToId(pkmn) { //used in renderAll
    if (pkmn === "") return "candyImg";
    return pkmn.replace(' ', '-').replace('.', '-');
}

function renderAll(imageMask, renderFunc, width, reverse=false) {
    $("#renderAll").prop('disabled', true);
    const $renderContent = $('#renderContent').html("");
    for (let pkmn in colorsDB) {
        $renderContent.append(`<div class="pkmn" style="width:${width}px" id="${pkmnToId(pkmn) + '_cell'}"><a id="${pkmnToId(pkmn)}"></a></div>`);
        let colors = [
            colorsDB[pkmn][(reverse) ? 1 : 0], colorsDB[pkmn][(reverse) ? 0 : 1], "#ffffff"
        ];
        //let filename = `GO ${pkmn} ${filenameBase}.png`;
        const container = document.getElementById(pkmnToId(pkmn) + '_cell');
        renderFunc(imageMask, colors, container);
        container.insertAdjacentHTML('beforeend', `<p>${pkmn}</p>`);
    }
    $("#clickAll").prop('disabled', false);
    $("#clickAll").click( async () => {
        for (field in colorsDB) {
            console.log(field);
            document.getElementById(pkmnToId(field)).click();
            await sleep(800);
        }
    });
}



function state() { //get state
    return {
        "color1": $("#color1").val(),
        "color2": $("#color2").val(),
        "color3": $("#color3").val()
    };
}

function renderXLLayers(imageMask) {
    $("#imgMask").html("");
    const gradient = [
        $("#color2").val(),
        $("#color1").val(),
        "#ffffff",
    ];
    const filename = fileSources['candyxl'];
    return imageMask.renderXLLayers(filename, gradient);
}

function renderMegaLayers(imageMask) {
    $("#imgMask").html("");
    const gradient = [
        $("#color1").val(),
        $("#color2").val(),
        $("#color3").val()
    ];
    return imageMask.renderMegaLayers(fileSources['mega'], gradient);
}

function renderCandyLayers(imageMask, pathname) {
    $("#imgMask").html("");
    const gradient = [
        $("#color1").val(),
        $("#color2").val(),
        "#ffffff"
    ];
    return imageMask.renderCandyLayers(fileSources[pathname], gradient);
}

function buildSelect(selectId) {
    let select = document.getElementById(selectId);
    for (let pkmn in colorsDB) {
        const value = [0, 1].map(i => colorsDB[pkmn][i]);
        let opt = `<option value='${JSON.stringify(value)}'>${pkmn}</option>`;
        select.insertAdjacentHTML('beforeend', opt);
    }
    select.oninput = function(evt) {
        const value = evt.currentTarget.value;
        const [color1, color2] = JSON.parse(value);
        document.getElementById("color1").value = "#" + color1;
        document.getElementById("color2").value = "#" + color2;
        $("#color2").trigger("change");
    }
    return select;
}

$(function() {
    let path = window.location.pathname.toLowerCase().split("/").pop();

    if (path == "xl") path = "candyxl";
    if (path == "art") path = "large";

    if (!['large', 'small', 'mega', 'candyxl'].includes(path))
        console.log("ERROR");
    else {
        const size = (path == "small") ? 64 :
            (path == "mega") ? 128 : 256;

        const renderFunc = (path == "mega") ? (im) => renderMegaLayers(im)
            : (path == "candyxl") ? (im) => renderXLLayers(im)
            : (im) => renderCandyLayers(im, path);

        const renderFunc2 = (path == "mega") ? (im, colors, container) => im.renderMegaLayers(fileSources['mega'], colors, container)
            : (path == "candyxl") ? (im, colors, container) => im.renderXLLayers(fileSources['candyxl'], colors, container)
            : (path == "small") ? (im, colors, container) => im.renderCandyLayers(fileSources['small'], colors, container)
            : (im, colors, container) => im.renderCandyLayers(fileSources['large'], colors, container);

        if (!['mega'].includes(path)) {
            $("#color3,[for='color3']").remove();
        }

        let imageMask = new ImageMask("imgMask", "#mainImg", size, size);

        renderFunc(imageMask).then(() => {

        });

        $("input").on("change", async (evt) => {
            await renderFunc(imageMask);
            updateInputDisp();
        });

        buildSelect('pkmnSelect');

        $("#renderAll").on("click", () => renderAll(imageMask, renderFunc2, size, path == 'candyxl'));
    }

/**
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
*/

});

function updateInputDisp() {
    $("input.imgInput").each((i, e) => {
        const $e = $(e);
        $(`#${$e.attr("id")}Disp`).text($e.val());
    });
}