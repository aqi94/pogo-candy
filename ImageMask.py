from PIL import Image, ImageColor
import os

def apply_color_mask(img, color):
    if not color.startswith("#"):
        color = "#" + color
    rgba = ImageColor.getrgb(color) + (0xff,)
    data = img.convert("RGBA").getdata()
    new_data = []
    for d in range(len(data)):
        pixel = tuple([int(data[d][c]/0xff * rgba[c]) for c in range(len(data[d]))])
        new_data.append(pixel)
    img.putdata(new_data)
    return img

def apply_color_mask_rgb(img, r_hex, g_hex, b_hex, background=None):
    data = img.convert("RGBA").getdata()
    canvas = Image.new("RGBA", img.size, (0, 0, 0, 0))
    if background:
        bg = ImageColor.getrgb(background if background.startswith("#") else "#" + background)
        bg_data = [bg + (d[3],) for d in data]
        canvas.putdata(bg_data)
    c = 0
    layers = []
    for layer in (r_hex, g_hex, b_hex):
        layer_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
        layer_color = ImageColor.getrgb(layer if layer.startswith("#") else "#" + layer)
        layer_data = [layer_color + (int(d[c] * d[3]/255),) for d in data]
        layer_img.putdata(layer_data)
        layers.append(layer_img)
        c += 1
    canvas.paste(layers[1], (0, 0), layers[1])
    canvas.paste(layers[0], (0, 0), layers[0])
    canvas.paste(layers[2], (0, 0), layers[2])
    return canvas

def render_image(*imgfile_color):
    try:
        canvas = Image.new("RGBA", imgfile_color[0].size, color=(0, 0, 0, 0))
        for i in range(0, len(imgfile_color), 2):
            img = imgfile_color[i]
            color = imgfile_color[i+1]
            layer = apply_color_mask(img, color)
            canvas.paste(layer, (0, 0), layer)
        return canvas
    except IndexError:
        raise ValueError("img_color parameters must be in filename-hexcolor pairs.")

def center_image(dir, width, height):
    for file in os.listdir(dir):
        if file.endswith(".png"):
            path = os.path.join(dir, file)
            print(path)
            img = Image.open(path, 'r')
            img = img.crop(img.getbbox())
            img_w, img_h = img.size
            background = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            bg_w, bg_h = background.size
            offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2)
            background.paste(img, offset)
            background.save(path)

if __name__ == "__main__":
    center_image("images", 256, 256)