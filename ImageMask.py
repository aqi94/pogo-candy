from PIL import Image, ImageColor
import os

def render_medals(frames_dir, inserts_dir, output_dir):
    inserts_dir = "images/Achievements"
    frames_dir = "images/badge_ring_4.png"
    output_dir = "images/outputs"

    frame = Image.open(frames_dir)
    frame_width, frame_height = frame.size
    for file in os.listdir(inserts_dir):
        if file.endswith(".png"):
            frame_cpy = frame.copy()
            path = os.path.join(inserts_dir, file)
            print(path)
            insert = Image.open(path, 'r')
            insert_width, insert_height = insert.size
            scale = 0.5
            insert = insert.resize((round(insert_width * scale), round(insert_height * scale)))
            insert.save(output_dir + "/" + file, "PNG")
            """
            insert_width, insert_height = insert.size
            x_offset = round((frame_width - insert_width)/2)
            y_offset = round((frame_height - insert_height)/2)
            frame_cpy.paste(insert, (x_offset, y_offset), insert)
            #f = open(output_dir + "/" + file, 'wb')
            #f.close()
            frame_cpy.save(output_dir + "/" + file, 'PNG')
            """




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

"""
Add extra pairs of width_height arguments as "backups" in case first sets are too small for image. 
"""
def center_image(dir, *width_height):
    for file in os.listdir(dir):
        if file.endswith(".png"):
            path = os.path.join(dir, file)
            print(path)
            img = Image.open(path, 'r')
            img = img.crop(img.getbbox())
            img_w, img_h = img.size

            i = 0
            while i < len(width_height) - 1:
                width = width_height[i]
                height = width_height[i + 1]
                if width >= img_w and height >= img_h:
                    break
                i += 2

            background = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            bg_w, bg_h = background.size
            offset = ((bg_w - img_w) // 2, (bg_h - img_h) // 2)
            background.paste(img, offset)
            background.save(path)

if __name__ == "__main__":
    #center_image("images/Achievements", 256, 256, 512, 512)
    render_medals("", "", "")