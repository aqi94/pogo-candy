import requests
import pandas as pd
import io

SRC = 'https://docs.google.com/spreadsheet/ccc?key=1ZBgY5sVCkGl4KRsNF5m0HPJZdRqOI7hl8dH3MtiQ02c&output=csv'
def get_colors(src=SRC):
    response = requests.get(src)
    assert response.status_code == 200, 'Wrong status code'
    df = pd.read_csv(io.StringIO(response.content.decode('utf-8')), dtype=object)
    return df.where(pd.notnull(df), None)

