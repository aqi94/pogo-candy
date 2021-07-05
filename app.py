from flask import Flask, request, render_template, url_for, redirect, Response, session, send_file, Blueprint
from flask_bootstrap import Bootstrap
import pandas as pd
import pathlib, os, io
from ImageMask import apply_color_mask_rgb, render_image, Image
from import_gs import get_colors

PATH = pathlib.Path(__file__).parent.absolute()

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

app.config['SECRET_KEY'] = 'secrettest123'
Bootstrap(app)

@app.route('/')
def home():
    return redirect(url_for("candy_render", path="art"))

@app.route('/get/<path>', methods=['GET'])
def api_render(path):
    base = request.args.get('base', 'ff00ff')
    secondary = request.args.get('secondary', 'ffffff')
    img_path = os.path.join(PATH, 'static/assets/images')
    if path == 'mega':
        img = Image.open(os.path.join(img_path, "pokemon_details_mega_candy.png"))
        parsed = apply_color_mask_rgb(img, base, secondary, "ffffff", secondary)
    elif path in ('xl', 'candyxl'):
        img = Image.open(os.path.join(img_path, "LV40_XLCandy_RGB_PSD.png"))
        parsed = apply_color_mask_rgb(img, secondary, base, "ffffff", "000000")
    else:
        if path in ('vector', 'small', 'icon'):
            name = 'vector'
        else:
            name = 'painted'
        files = (f"candy_{name}_base_color.png", f"candy_{name}_secondary_color.png", f"candy_{name}_highlight.png")
        imgs = [Image.open(os.path.join(img_path, f)) for f in files]
        parsed = render_image(imgs[0], base, imgs[1], secondary, imgs[2], "ffffff")

    # create file-object in memory
    file_object = io.BytesIO()
    # write PNG in file-object
    parsed.save(file_object, 'PNG')
    # move to beginning of file so `send_file()` it will read from start
    file_object.seek(0)

    return send_file(file_object, mimetype='image/PNG')

"""
@app.route('/<path>', methods=['GET'])
def candy_render(path):
    def build_colors_db():
        colors = get_colors()
        colors_dict = {}
        for idx, row in colors.iterrows():
            if row['Base color']:
                base = row['Base color']
                secondary = row['Ring color']
                key = row['Candy'].replace(" Candy", "")
                if path == "mega":
                    colors_dict[key] = [secondary, base, "ffffff", secondary]
                else:
                    colors_dict[key] = [base, secondary, "ffffff", "000000"]
        return colors_dict

    colors_db = build_colors_db()
    background_img = ""
    mega = "false"
    if path in ("xl", "candyxl"):
        image = "candy_xl"
        background_img = "candy_xl_background"
        width, height = 256, 256
        filename = "Candy XL"
    elif path in ("mega",):
        image = "candy_mega"
        background_img = "candy_mega_background"
        width = height = 128
        filename = "Mega Energy"
        return render_template('megaenergy.html', width=width, height=height, filename=filename, image=image)
    elif path in ('vector', 'small'):
        image = "candy_vector"
        width = height = 64
        filename = "Candy"
    else:
        image = "candy_painted"
        width = height = 256
        filename = "Candy artwork"

    base = request.args.get('base', "ff00ff")
    secondary = request.args.get('secondary', "ffffff")

    # colors_db = json.dumps(colors_db)
    # print(colors_db)
    return render_template('candyxl.html', image=image, colors_db=colors_db, background=background_img,
                           width=width, height=height, mega=mega, base=base, secondary=secondary, filename=filename)
"""

@app.route('/<path>', methods=['GET'])
def candy_render(path):
    def build_colors_db():
        colors = get_colors()
        colors_dict = {}
        for idx, row in colors.iterrows():
            if row['Base color']:
                base = row['Base color']
                secondary = row['Ring color']
                key = row['Candy'].replace(" Candy", "")
                if path == "mega":
                    colors_dict[key] = [secondary, base, "ffffff", secondary]
                else:
                    colors_dict[key] = [base, secondary, "ffffff", "000000"]
        return colors_dict

    colors_db = build_colors_db()
    return render_template('candy_render.html', colors_db=colors_db)

if __name__ == "__main__":
    app.run(debug=True)
