

function swapColors(containerId) {
    let color1 = document.getElementById("color1");
    let color2 = document.getElementById("color2")
    let temp = color1.value;
    color1.value = color2.value;
    color2.value = temp;
    inputToRender(containerId);
}

function inputToRender(containerId) {
    primaryColor = document.getElementById("color1").value;
    document.getElementById("color1Disp").innerHTML = primaryColor.toUpperCase();
    secondaryColor = document.getElementById("color2").value;
    document.getElementById("color2Disp").innerHTML = secondaryColor.toUpperCase();
    background = (isMega) ? primaryColor : "000000";
    filename = `PoGO_Candy_${primaryColor.replace("#", "").toUpperCase()}_${secondaryColor.replace("#", "").toUpperCase()}.png`
    render2(primaryColor, secondaryColor, containerId, filename, "ffffff", background);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pkmnToId(pkmn) {
    if (pkmn === "") return "candyImg";
    return pkmn.replace(' ', '-').replace('.', '-');
}
function renderAll() {
    $("#renderAll").prop('disabled', true);
    $renderContent = $('#renderContent');
    $renderContent.html("");
    for (pkmn in colorsDB) {
        $renderContent.append(`<div class="pkmn" style="width:${WIDTH}px" id="${pkmnToId(pkmn) + '_cell'}"><a id="${pkmnToId(pkmn)}"></a></div>`);
        let primaryColor = colorsDB[pkmn][0];
        let secondaryColor = colorsDB[pkmn][1];
        let highlight = (colorsDB[pkmn].length > 2) ? colorsDB[pkmn][2] : "ffffff";
        let background = (colorsDB[pkmn].length > 3) ? colorsDB[pkmn][3] : "000000";
        let filename = `GO ${pkmn} ${filenameBase}.png`
        render2(primaryColor, secondaryColor, pkmnToId(pkmn), filename, highlight, background);
        document.getElementById(pkmnToId(pkmn) + '_cell').insertAdjacentHTML('beforeend', `<p>${pkmn}</p>`);
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