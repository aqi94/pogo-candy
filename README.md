# Pokemon GO Candy generator

Generates Pokemon GO Candy by using color masking on in-game templates.

## Setup
Python 3.7+ is required.
Ensure all the required packages listed in ```requirements.txt``` are installed.

```bash
pip install -r requirements.txt
```

## Usage

```python
python app.py
```
On your browser (Chrome recommended), navigate to ```http://127.0.0.1:5000``` to use the app. Append the following for these templates:

* Candy artwork -- ```/art```
* Candy small icon -- ```/small```
* Candy XL -- ```/xl```
* Mega Energy (Testing) -- ```/mega```

The application will have an option to render an image based on two colorpickers or from a dropdown of known Candy colors in ```CandyColors.csv```. Click the ```Render All``` button to render all Candy from ```CandyColors.csv```, in the lower page. (This will take a few seconds.) Click the ```Download All``` button to download/save all the rendered images. (The downloads will be executed one at a time.)
