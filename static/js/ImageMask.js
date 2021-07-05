export default class ImageMask {
    /** color conversion functions */
    static rgbToHsl(r, g, b){
       r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    }

    static hslToRgb(h, s, l){
        let r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    static hexToHsl(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min){
          h = s = 0; // achromatic
        } else{
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
      return [h, s, l];
    }

    static hexToRgbA(hex){
        if (/^#([A-F0-9]{3}){1,2}$/i.test(hex)) {
            let c = hex.substring(1).split('');
            if (c.length === 3){
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = parseInt(c.join(''), 16);
            return [(c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF, 0xFF];
        }
    }
    /** end color conversion functions */


    /** returns layer context */
    static createLayer(width, height) {
        const layer = document.createElement('canvas');
        layer.className = 'layer';
        layer.width = width;
        layer.height = height || width;
        return layer.getContext('2d');
    }

    static loadImage(src, callback) {
        const img = new Image();
        img.onload = callback;
            /**
            img.onload = function(e) {
                if (IMAGESLoaded++ >= IMAGES.length - 1) {
                    callback(); //callback when all images has been loaded, regardless of order
                }
            };**/
        img.src = src;
        return img;
    }

    static loadImage2(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    //rgb is the index of color to apply alpha for. if masking Green layer, rgb=1...
    applyColorMask1(ctx, color) {
        if (color.indexOf('#') !== 0) color = '#' + color;
        const rgba = ImageMask.hexToRgbA(color);
        let imgData = ctx.getImageData(0, 0, this.width, this.height);
        for (let byte = 0; byte < imgData.data.length; byte += 4) {
            for (let p = 0; p < 4; p++) {
                imgData.data[byte + p] = rgba[p] * (imgData.data[byte + p] / 255);
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // gradient is a 2-3 elem array
    applyColorMask2(ctx, gradient) {
        const rgbaGradient = gradient.map(c => (c.startsWith("#")) ? c : "#" + c).map(c => ImageMask.hexToRgbA(c));

        const pickGradient = (gradient, percent) => { //gradient as array of rgba
            const n = gradient.length - 1;
            const p = n * percent; //locate percent within gradient
            //console.log(p, n, percent);
            const limits = [Math.floor(p), Math.ceil(p)].map(i => gradient[i]);
            //console.log(limits, "limits")
            const distance = p - Math.floor(p); //% difference from color[limit[0]
            return limits[0].map((c, i) => {
                const offset = (limits[1][i] - limits[0][i]) * distance;
                return Math.round(c + offset);
            }); //returns rgba of gradient
        }

        let imgData = ctx.getImageData(0, 0, this.width, this.height);

//        const grey = Array.from(imgData.data).map((c, i, arr) => {
//            if (c % 4 == 0 || arr[i+3] > 0) {
//                if (arr[i+1] == arr[i+2] == 0)
//                    return c;
//            }
//            return null;
//        }).filter(c => c);
//        console.log(grey, Math.min(...grey), Math.max(...grey));
        const [minP, maxP] = [102, 204]; //[Math.min(...grey), Math.max(...grey)]; //todo: not hardcoded
        for (let byte=0; byte < imgData.data.length; byte += 4) {
            const p = [0,1,2,3].map((i) => imgData.data[byte + i]);
            if (!p.every((val, i, arr) => val == arr[0] || i == 3))
                console.log("greyscale error:", p);
            const percent = (maxP - p[0]) / (maxP - minP);
            const color = pickGradient(rgbaGradient, Math.min(Math.max(percent, 0), 1));
            color.forEach((px, i) => {
                if (i < 3)
                    imgData.data[byte + i] = px;
            });
        }
        ctx.putImageData(imgData, 0, 0);
    }

    //replaces based on HSL
    /**
        @param ctx {Canvas.getContext}
    */
    applyColorMask3(ctx, color) {
        if (color.indexOf('#') !== 0) color = '#' + color;
        let [h, s, l] = ImageMask.hexToHsl(color);
        let imgData = ctx.getImageData(0, 0, this.width, this.height);
        for (let byte=0; byte < imgData.data.length; byte+=4) {
            let p = Array(4).map((e, i) => imgData.data[byte + i]);
            let [h2, s2, l2] = ImageMask.rgbToHsl(p[0], p[1], p[2]);
            let rgb2 = ImageMask.hslToRgb(h, s, l2);
            rgb2.forEach((c, i) => imgData.data[byte + i] = c);
        }
        ctx.putImageData(imgData, 0, 0);
    }

    /**
     * transparent = true if a full white transparency mask, else a greyscale gradient
    */
    splitRGBLayers(ctx, transparent=true) {
        let oldData = ctx.getImageData(0, 0, this.width, this.height);
        return [0, 1, 2].map(i => {
            const newCtx = ImageMask.createLayer(this.width, this.height);
            newCtx.drawImage(ctx.canvas, 0, 0);
            let imgData = newCtx.getImageData(0, 0, this.width, this.height);
            for (let byte=0; byte < oldData.data.length; byte+=4) {
                for (let p=0; p<4; p++) {
                    if (p == 3) { //alpha
                        if (transparent) {
                            imgData.data[byte + p] = oldData.data[byte + i];
                        }
                    } else {
                        imgData.data[byte + p] = (transparent) ? 255 : oldData.data[byte + i]; //255 not 0
                    }
                }
            }
            newCtx.putImageData(imgData, 0, 0);
            return newCtx;
        });
    }

    applyColorMask(ctx, colorObj) {
        if (Array.isArray(colorObj))
            return this.applyColorMask2(ctx, colorObj)

        const color = (colorObj.indexOf('#') !== 0) ? '#' + colorObj : colorObj;
        if (color.length > 7)  //alpha mask
            return this.applyColorMask1(ctx, color);

        return this.applyColorMask3(ctx, color);
    }


    constructor(id, parent, width, height) {
        this._id = id;
        this._$parent = $(parent);
        this.$ = $(`<div id='${id}'></div>`).appendTo(this._$parent);
        [this.width, this.height] = [width, height];
    }

    createImageDOM(src, container) {
        const img = ImageMask.loadImage(src);
        container.appendChild(img);
        return img;
    }

    //for mega energy
    renderMegaLayers(src, gradient, container) {
        const ctx = ImageMask.createLayer(this.width, this.height);
        return (async () => {
            const img = await ImageMask.loadImage2(src);

            ctx.drawImage(img, 0, 0);

            const layers = (() => {
                const l1 = this.splitRGBLayers(ctx, false);
                const l2 = this.splitRGBLayers(ctx, true);
                l2[0] = l1[0];
                //l2[1] = l1[1];
                return l2;
            })();

            this.applyColorMask2(layers[0], gradient);

            const renderLayer = ImageMask.createLayer(this.width, this.height);
            layers.forEach((lay, i) => renderLayer.drawImage(lay.canvas, 0, 0));
            if (!container) container = this.$[0];
            this.createImageDOM(renderLayer.canvas.toDataURL(), container);
        })();
    }

    renderXLLayers(src, gradient, container) {
        const ctx = ImageMask.createLayer(this.width, this.height);
        return (async () => {
            const img = await ImageMask.loadImage2(src);

            ctx.drawImage(img, 0, 0);

            const layers = (() => {
                let l1 = this.splitRGBLayers(ctx, true);
                let l2 = this.splitRGBLayers(ctx, false);
                l1[0] = l2[0];
                return l1;
            })();
            layers.forEach((layer, i) => this.applyColorMask1(layer, gradient[i]));

            const renderLayer = ImageMask.createLayer(this.width, this.height);
            layers.forEach((lay, i) => renderLayer.drawImage(lay.canvas, 0, 0));
            //layers.forEach((lay, i) => this.createImageDOM(lay.canvas.toDataURL(), this.$[0]));

            this.createImageDOM(renderLayer.canvas.toDataURL(), container || this.$[0]);

        })();
    }

    renderCandyLayers(srcArr, gradient, container) {
        const layers = srcArr.map(async (src, i) => {
            const ctx = ImageMask.createLayer(this.width, this.height);
            const image = await ImageMask.loadImage2(src);
            ctx.drawImage(image, 0, 0);
            this.applyColorMask1(ctx, gradient[i]);
            return ctx;
        });

        return Promise.all(layers).then((ctxLayers) => {
            const renderLayer = ImageMask.createLayer(this.width, this.height);
            ctxLayers.forEach(lay => {
                renderLayer.drawImage(lay.canvas, 0, 0);
            });

            this.createImageDOM(renderLayer.canvas.toDataURL(), container || this.$[0]);
        });
    }

    //srcArr should be in order of frame, medal, extra
    renderMedal(srcArr, gradient, container, offset=[0, 0]) {
        const layers = srcArr.map(async (src, i) => {
            const ctx = ImageMask.createLayer(imageMask.width, imageMask.height);
            const image = await ImageMask.loadImage2(src);
            ctx.drawImage(image, 0, 0);
            return ctx;
        });

        return Promise.all(layers).then((ctxLayers) => {
            //combine into one image
            const renderLayer = ImageMask.createLayer(imageMask.width, imageMask.height);
            ctxLayers.forEach(lay => {
                renderLayer.drawImage(lay.canvas, 0, 0); //todo implement offset
            });

            const splitLayers = (() => {
                let l1 = this.splitRGBLayers(renderLayer, true);
                let l2 = this.splitRGBLayers(renderLayer, false);
                l1[0] = l2[0];
                return l1;
            })();
            splitLayers.forEach((layer, i) => this.applyColorMask1(layer, gradient[i]));

            const renderLayer2 = ImageMask.createLayer(this.width, this.height);
            splitLayers.forEach((lay, i) => renderLayer2.drawImage(lay.canvas, 0, 0));
            //layers.forEach((lay, i) => this.createImageDOM(lay.canvas.toDataURL(), this.$[0]));

            this.createImageDOM(renderLayer2.canvas.toDataURL(), container || this.$[0]);
        });
    }

    render(imageLayers, imageColors, filename="ImageMask") {

        const layers = imageLayers.map(i => ImageMask.createLayer(this.width, this.height));

        layers.forEach((layer, i) => {
            ImageMask.applyColorMask(layer, imageColors[i]); //3 modes: alpha, gradient-hsl, hsl-mask
            layers[0].drawImage(layer, 0, 0);
        });

        let $canvas = $(layer[0].canvas);
        let src = $canvas[0].toDataURL();
        let img = document.createElement("image");
        img.setAttribute("src", src);
        img.setAttribute("class", "imgMask");
        img.setAttribute("title", filename)

        container = this._$parent[0];
        container.innerHTML = img.outerHTML;
        container.setAttribute("href", src);
        container.setAttribute("download", filename);
    }
}