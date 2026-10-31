# Arma js/banderas-img.js: cada bandera de esta carpeta como imagen embebida (alto 48 px, PNG),
# respetando su proporción. Las que vienen más altas que anchas se completan a 3:2
# repitiendo la columna del borde (sirve para franjas horizontales o fondo liso).
import base64, io, os, json
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
H = 48
out = {}
for f in sorted(os.listdir(here)):
    nombre, ext = os.path.splitext(f)
    if ext.lower() not in ('.webp', '.png', '.jpg', '.jpeg'): continue
    im = Image.open(os.path.join(here, f)).convert('RGB')
    w, h = im.size
    if w / h < 1.3:
        nw = int(h * 1.5); lienzo = Image.new('RGB', (nw, h)); x0 = (nw - w) // 2
        izq = im.crop((0, 0, 1, h)).resize((x0, h)); der = im.crop((w-1, 0, w, h)).resize((nw - w - x0, h))
        lienzo.paste(izq, (0, 0)); lienzo.paste(im, (x0, 0)); lienzo.paste(der, (x0 + w, 0)); im = lienzo; w, h = im.size
    nw = round(H * w / h)
    im = im.resize((nw, H), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    out[nombre] = { 'src': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode(), 'r': round(w / h, 3) }
js = '/* Generado por banderas-src/generar.py a partir de las imágenes de esa carpeta. */\nwindow.BANDERAS_IMG = ' + json.dumps(out) + ';\n'
open(os.path.join(here, '..', 'js', 'banderas-img.js'), 'w').write(js)
print(len(out), 'banderas,', len(js) // 1024, 'KB')
