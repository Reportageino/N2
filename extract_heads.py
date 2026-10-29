"""Cuts Nima's painted heads out of the reference sheet (1000042852.png).
Background is removed with a border flood-fill over light-grey pixels; the shirt collar
under the beard is removed with a hand-placed polygon (same template for every head of a row).
Outputs PNGs + heads.json (eye boxes for blinking/glasses, neck pivot)."""
import json, sys, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

SHEET = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/1000042852.png'
OUT = '/home/claude/nima-neon-rampage/assets/heads/'
im = Image.open(SHEET).convert('RGB'); A = np.array(im).astype(int)

def bgmask(sub):
    mx, mn = sub.max(2), sub.min(2)
    return (mx - mn < 30) & (sub.mean(2) > 178)

def cut(name, box, poly, pad=4):
    x0, y0, x1, y1 = box; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
    sub = A[y0:y1, x0:x1]
    bg = bgmask(sub)
    # flood fill background from top/left/right borders only
    lab, _ = ndimage.label(bg)
    border = set(lab[0, :]) | set(lab[:, 0]) | set(lab[:, -1]) | set(lab[-1, :])
    border.discard(0)
    outside = np.isin(lab, list(border))
    keep = ~outside
    # polygon (sheet coords) -> local mask
    pm = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(pm).polygon([(px - x0, py - y0) for px, py in poly], fill=255)
    keep &= np.array(pm) > 0
    keep = ndimage.binary_opening(keep, iterations=1)
    lab2, n = ndimage.label(keep)
    if n > 1:  # keep the largest blob only
        sizes = ndimage.sum(keep, lab2, range(1, n + 1)); keep = lab2 == (np.argmax(sizes) + 1)
    keep = ndimage.binary_fill_holes(keep)
    # defringe: light anti-alias halo next to the cut becomes outline ink, then a soft 1px edge
    sub = sub.copy()
    ring = keep & ~ndimage.binary_erosion(keep, iterations=2)
    light = (sub.mean(2) > 120) & ((sub.max(2) - sub.min(2)) < 70)
    sub[ring & light] = [26, 18, 41]
    alpha = keep.astype(float)
    edge = keep & ~ndimage.binary_erosion(keep)
    alpha[edge] = 0.8
    rgba = np.dstack([sub, (alpha * 255).astype(int)]).astype(np.uint8)
    # trim
    ys, xs = np.where(keep)
    ty0, ty1, tx0, tx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = rgba[ty0:ty1, tx0:tx1]
    Image.fromarray(rgba, 'RGBA').save(OUT + name + '.png')
    k = keep[ty0:ty1, tx0:tx1]; S = sub[ty0:ty1, tx0:tx1]
    # eye whites: bright, low saturation, inside the face area (rows 40%-75%)
    h, w = k.shape
    mx, mn = S.max(2), S.min(2)
    white = k & (S.mean(2) > 215) & (mx - mn < 40)
    white[: int(h * 0.38)] = False; white[int(h * 0.72):] = False
    l3, m = ndimage.label(white)
    eyes = []
    for i, sl in enumerate(ndimage.find_objects(l3)):
        if (l3[sl] == i + 1).sum() > 18:
            eyes.append([int(sl[1].start), int(sl[0].start), int(sl[1].stop), int(sl[0].stop)])
    eyes.sort()
    # neck pivot: centre of the lowest 6 rows of the beard
    rows = np.where(k.any(1))[0]; bottom = rows.max()
    cols = np.where(k[bottom - 6])[0]
    piv = [int((cols.min() + cols.max()) / 2), int(bottom)]
    return {'w': int(w), 'h': int(h), 'eyes': eyes, 'pivot': piv}

meta = {}
# expression row: bbox per head; polygon template relative to head 1 (x0=15,y0=360)
EXPR = [('neutral', 15, 360), ('angry', 149, 361), ('happy', 285, 360), ('surprised', 420, 361), ('fierce', 561, 361), ('smirk', 705, 361)]
T_EXPR = [(-5, -8), (152, -8), (152, 116), (125, 126), (113, 134), (100, 139), (55, 139), (47, 134), (40, 124), (35, 110), (29, 102), (15, 100), (-5, 100)]
for n, bx, by in EXPR:
    poly = [(bx + dx, by + dy) for dx, dy in T_EXPR]
    meta[n] = cut(n, (bx, by, bx + 132, by + 137), poly)
# hat row (smaller heads)
HATS = [('hat_beige', 17, 547, 99), ('hat_black', 120, 547, 110), ('hat_beanie', 232, 539, 92), ('hat_camo', 326, 544, 98),
        ('hat_red', 432, 543, 105), ('hat_neon', 535, 543, 103), ('hat_bucket', 637, 543, 109), ('hat_gray', 742, 545, 100)]
for n, bx, by, bw in HATS:
    bottom = 652
    # beard is roughly centred; collar sits low-left. template scaled to the head width
    cx = bx + bw * 0.55
    poly = [(bx - 6, by - 8), (bx + bw + 6, by - 8), (bx + bw + 6, bottom - 18), (cx + 30, bottom - 8), (cx + 18, bottom + 2),
            (cx - 22, bottom + 2), (cx - 30, bottom - 6), (cx - 36, bottom - 16), (bx - 6, bottom - 22)]
    meta[n] = cut(n, (bx, by, bx + bw, bottom), poly)
# front-ish view (turnaround "رو به رو") for the turn animation
FB = (119, 68)
poly = [(110, 60), (275, 60), (275, 178), (262, 186), (250, 198), (232, 207), (165, 207), (150, 198), (140, 186), (110, 180)]
meta['front'] = cut('front', (119, 68, 267, 210), poly)
json.dump(meta, open(OUT + 'heads.json', 'w'), indent=1)
print(json.dumps(meta))

# ---- King Aryan: dark neon background, so the head is cut with a traced polygon and re-inked ----
def cut_poly(name, poly, ink=(18, 10, 22)):
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    x0, y0, x1, y1 = int(min(xs)) - 4, int(min(ys)) - 4, int(max(xs)) + 5, int(max(ys)) + 5
    sub = A[y0:y1, x0:x1].copy()
    pm = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(pm).polygon([(px - x0, py - y0) for px, py in poly], fill=255)
    inner = np.array(pm) > 0
    core = ndimage.binary_erosion(inner, iterations=1)
    ring = inner & ~ndimage.binary_erosion(inner, iterations=3)
    sub[ring] = ink
    alpha = inner.astype(float); alpha[inner & ~core] = 0.85
    rgba = np.dstack([sub, (alpha * 255).astype(int)]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(OUT + name + '.png')
    S = sub; h, w = inner.shape
    white = inner & (S.mean(2) > 165) & ((S.max(2) - S.min(2)) < 60)
    white[: int(h * 0.4)] = False; white[int(h * 0.68):] = False
    l3, m = ndimage.label(white); eyes = []
    for i, sl in enumerate(ndimage.find_objects(l3)):
        if (l3[sl] == i + 1).sum() > 10: eyes.append([int(sl[1].start), int(sl[0].start), int(sl[1].stop), int(sl[0].stop)])
    eyes.sort()
    return {'w': int(w), 'h': int(h), 'eyes': eyes, 'pivot': [int(1259 - x0), int(184 - y0)]}

ARYAN = [(1187.5, 136), (1172, 117), (1180, 82), (1190, 62), (1205, 51), (1216, 40), (1225, 31), (1240, 30), (1255, 27), (1274, 23),
         (1267, 32), (1290, 32), (1310, 40), (1316, 50), (1327, 55), (1322, 72), (1322, 88), (1310, 100), (1306, 117), (1300, 140),
         (1295, 160), (1285, 175), (1267, 185), (1250, 185), (1232, 175), (1215, 160), (1206, 145), (1200, 140)]
meta['aryan'] = cut_poly('aryan', ARYAN)
json.dump(meta, open(OUT + 'heads.json', 'w'), indent=1)
print('aryan', meta['aryan'])
