#!/usr/bin/env python3
"""Generate octopus-box.json — a Lottie animation of an octopus swimming
across an underwater scene, then getting sucked into a cardboard box.

Timeline (30 fps, 195 frames / 6.5 s):
  0-100   octopus swims in from the left, tentacles undulating, bubbles rise
  100-112 anticipation pause in front of the box, suction lines appear
  112-150 octopus is pulled into the box: arcs up, stretches, plunges in
  148-166 poof burst, box squash-and-stretch wiggle, lid flaps snap shut
  166-195 settle

Run:  python3 generate_octopus_lottie.py   (writes octopus-box.json next to it)
"""
import json
import math
import os

W, H = 800, 600
FR = 30
OP = 195

# ---------------------------------------------------------------- helpers

def color(hexstr):
    hexstr = hexstr.lstrip('#')
    return [int(hexstr[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [1]


def static(v):
    return {"a": 0, "k": v}


def anim(keys):
    return {"a": 1, "k": keys}


def kf(t, s, ox=0.35, oy=0.0, ix=0.65, iy=1.0, hold=False):
    """One keyframe. Easing defaults to a gentle ease-in-out."""
    k = {"t": t, "s": s if isinstance(s, list) else [s],
         "o": {"x": [ox], "y": [oy]}, "i": {"x": [ix], "y": [iy]}}
    if hold:
        k["h"] = 1
    return k


def last(t, s):
    return {"t": t, "s": s if isinstance(s, list) else [s]}


def fill(c, opacity=100):
    return {"ty": "fl", "c": static(color(c)), "o": static(opacity)}


def stroke(c, width, opacity=100):
    return {"ty": "st", "c": static(color(c)), "o": static(opacity),
            "w": static(width), "lc": 2, "lj": 2}


def ellipse(cx, cy, w, h):
    return {"ty": "el", "p": static([cx, cy]), "s": static([w, h])}


def rect(cx, cy, w, h, r=0):
    return {"ty": "rc", "p": static([cx, cy]), "s": static([w, h]),
            "r": static(r)}


def group(name, items, p=None, a=None, s=None, r=None, o=None):
    """Shape group; p/a/s/r/o may be static values or animated dicts."""
    def prop(v, default):
        if v is None:
            return static(default)
        return v if isinstance(v, dict) else static(v)
    tr = {"ty": "tr",
          "p": prop(p, [0, 0]), "a": prop(a, [0, 0]),
          "s": prop(s, [100, 100]), "r": prop(r, 0), "o": prop(o, 100)}
    return {"ty": "gr", "nm": name, "it": items + [tr]}


def smooth_path(pts, closed=False, tension=0.25):
    """Bezier path through pts with catmull-rom-ish smooth tangents."""
    n = len(pts)
    v, i_tan, o_tan = [], [], []
    for j in range(n):
        p_prev = pts[max(0, j - 1)]
        p_next = pts[min(n - 1, j + 1)]
        dx = (p_next[0] - p_prev[0]) * tension
        dy = (p_next[1] - p_prev[1]) * tension
        v.append([round(pts[j][0], 2), round(pts[j][1], 2)])
        o_tan.append([round(dx, 2), round(dy, 2)])
        i_tan.append([round(-dx, 2), round(-dy, 2)])
    return {"i": i_tan, "o": o_tan, "v": v, "c": closed}


def path_shape(path_or_keys):
    if isinstance(path_or_keys, list):  # animated
        return {"ty": "sh", "ks": anim(path_or_keys)}
    return {"ty": "sh", "ks": static(path_or_keys)}


def transform(p=None, a=None, s=None, r=None, o=None):
    def prop(v, default):
        if v is None:
            return static(default)
        return v if isinstance(v, dict) else static(v)
    return {"o": prop(o, 100), "r": prop(r, 0),
            "p": prop(p, [0, 0, 0]), "a": prop(a, [0, 0, 0]),
            "s": prop(s, [100, 100, 100])}


def shape_layer(ind, name, shapes, ks, ip=0, op=OP, parent=None):
    layer = {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1,
             "ks": ks, "ao": 0, "shapes": shapes,
             "ip": ip, "op": op, "st": 0, "bm": 0}
    if parent is not None:
        layer["parent"] = parent
    return layer


# ---------------------------------------------------------------- octopus precomp

OCTO_W, OCTO_H = 300, 300


def tentacle_path(base_x, base_y, length, t, phase, sway=1.0):
    """Tentacle as 4 points hanging down from (base_x, base_y), swaying."""
    omega = 2 * math.pi / 30  # one wave cycle per 30 frames (1 s)
    amps = [0, 7, 15, 26]
    pts = []
    for j in range(4):
        wob = amps[j] * sway * math.sin(omega * t + phase + j * 1.1)
        pts.append([base_x + wob, base_y + length * j / 3])
    return smooth_path(pts)


def tentacle_shape(idx, base_x, base_y, length, phase, colr, width):
    keys = []
    step = 5
    for t in range(0, OP + step, step):
        keys.append({"t": t,
                     "s": [tentacle_path(base_x, base_y, length, t, phase)],
                     "o": {"x": [0.33], "y": [0.33]},
                     "i": {"x": [0.67], "y": [0.67]}})
    keys[-1] = {"t": OP, "s": keys[-1]["s"]}
    return group(f"tentacle{idx}",
                 [path_shape(keys), stroke(colr, width)])


def octopus_layers():
    """Layers inside the 300x300 octopus precomp."""
    # -- tentacles (drawn behind the head)
    tentacles = []
    specs = [  # (base_x, length, phase, color, width)
        (100, 92, 0.0, "#c94b38", 12),
        (122, 104, 1.2, "#d05540", 13),
        (144, 112, 2.4, "#d05540", 14),
        (166, 108, 3.6, "#d05540", 13),
        (188, 96, 4.8, "#c94b38", 12),
        (205, 82, 5.7, "#c94b38", 10),
    ]
    for i, (bx, ln, ph, c, w) in enumerate(specs):
        tentacles.append(tentacle_shape(i, bx, 138, ln, ph, c, w))

    tent_layer = shape_layer(2, "tentacles", tentacles,
                             transform(p=[0, 0, 0]))

    # -- head with a gentle breathing pulse
    pulse = anim(
        [kf(t, [100, 100 + 5 * math.sin(2 * math.pi * t / 45)],
            0.33, 0.33, 0.67, 0.67) for t in range(0, OP, 5)] +
        [last(OP, [100, 100])])
    # NB: lottie renders the first shape group on top, so face details
    # come first and the mantle goes last
    head_items = [
        group("smile", [path_shape(smooth_path(
            [[140, 114], [152, 121], [164, 114]])),
            stroke("#a03c2c", 5)]),
        group("cheek_l", [ellipse(0, 0, 18, 12), fill("#f5a09a", 80)],
              p=[112, 112]),
        group("cheek_r", [ellipse(0, 0, 18, 12), fill("#f5a09a", 80)],
              p=[192, 112]),
        group("pupil_l", [ellipse(0, 0, 13, 15), fill("#2b2b2b")],
              p=[132, 90]),
        group("pupil_r", [ellipse(0, 0, 13, 15), fill("#2b2b2b")],
              p=[180, 90]),
        group("eye_l", [ellipse(0, 0, 30, 32), fill("#ffffff")],
              p=[128, 88]),
        group("eye_r", [ellipse(0, 0, 30, 32), fill("#ffffff")],
              p=[176, 88]),
        group("belly", [ellipse(0, 22, 88, 62), fill("#f2907d")],
              p=[152, 92]),
        group("mantle", [ellipse(0, 0, 132, 118), fill("#e8654f")],
              p=[152, 92], a=[0, 0], s=pulse),
    ]
    head_layer = shape_layer(1, "head", head_items, transform())
    return [head_layer, tent_layer]


# ---------------------------------------------------------------- main comp layers

BOX_CX, BOX_MOUTH_Y = 655, 392   # centre of the box opening


def octopus_main_layer():
    """The octopus precomp: swim path, anticipation, then suck-in."""
    pos = anim([
        kf(0, [-120, 330, 0], 0.4, 0, 0.6, 1),
        kf(22, [50, 295, 0], 0.4, 0, 0.6, 1),
        kf(48, [195, 345, 0], 0.4, 0, 0.6, 1),
        kf(74, [320, 290, 0], 0.4, 0, 0.6, 1),
        kf(100, [415, 320, 0], 0.35, 0, 0.65, 1),
        kf(112, [392, 308, 0], 0.4, 0, 0.6, 1),          # pulled-back anticipation
        kf(134, [560, 225, 0], 0.7, 0, 0.5, 0.4),        # yanked up toward the box
        kf(150, [BOX_CX, 415, 0], 0.5, 0, 0.2, 1),       # plunges into the box
        last(OP, [BOX_CX, 415, 0]),
    ])
    scale = anim([
        kf(100, [100, 100, 100]),
        kf(112, [92, 108, 100]),                          # anticipation squash
        kf(136, [138, 66, 100], 0.6, 0, 0.4, 1),          # stretched by the pull
        kf(150, [4, 4, 100], 0.5, 0, 0.3, 1),             # gone
        last(OP, [0, 0, 100]),
    ])
    rot = anim([
        kf(0, 0), kf(22, -7), kf(48, 6), kf(74, -6), kf(100, 3),
        kf(112, -4),
        kf(134, 42, 0.6, 0, 0.4, 1),
        kf(150, 88, 0.5, 0, 0.3, 1),                      # head-first, straight down
        last(OP, 88),
    ])
    opacity = anim([kf(149, 100, hold=True), last(151, 0)])
    return {"ddd": 0, "ind": 10, "ty": 0, "nm": "octopus", "refId": "octo",
            "sr": 1,
            "ks": transform(p=pos, a=[152, 105, 0], s=scale, r=rot, o=opacity),
            "ao": 0, "w": OCTO_W, "h": OCTO_H,
            "ip": 0, "op": OP, "st": 0, "bm": 0}


def box_layer():
    """Cardboard box, open top; flaps snap shut after the octopus is in."""
    flap_l_rot = anim([
        kf(0, -115, hold=True),
        kf(152, -115, 0.5, 0, 0.4, 1),
        kf(163, 9, 0.5, 0, 0.4, 1),                       # overshoot
        kf(169, 0, hold=True),
        kf(183, 0, 0.4, 0, 0.5, 1),                       # pop back open so the loop is seamless
        last(193, -115),
    ])
    flap_r_rot = anim([
        kf(0, 115, hold=True),
        kf(154, 115, 0.5, 0, 0.4, 1),
        kf(165, -9, 0.5, 0, 0.4, 1),
        kf(171, 0, hold=True),
        kf(184, 0, 0.4, 0, 0.5, 1),
        last(194, 115),
    ])
    # first group renders on top: flaps over the opening, details over the
    # front face, the dark opening at the very back
    items = [
        group("flap_left", [rect(35, 0, 70, 13, 3), fill("#c99a5b"),
                            stroke("#8a5f30", 2)],
              p=[BOX_CX - 74, BOX_MOUTH_Y], a=[0, 0], r=flap_l_rot),
        group("flap_right", [rect(-35, 0, 70, 13, 3), fill("#b9884a"),
                             stroke("#8a5f30", 2)],
              p=[BOX_CX + 74, BOX_MOUTH_Y], a=[0, 0], r=flap_r_rot),
        group("tape", [rect(0, 0, 18, 124), fill("#8a5a2a", 55)],
              p=[BOX_CX, BOX_MOUTH_Y + 74]),
        group("label", [rect(0, 0, 46, 26, 3), fill("#e8dcc8")],
              p=[BOX_CX + 38, BOX_MOUTH_Y + 88], r=-6),
        group("front_shade", [rect(0, 0, 150, 34, 5), fill("#a97a42")],
              p=[BOX_CX, BOX_MOUTH_Y + 29]),
        group("front", [rect(0, 0, 150, 124, 5), fill("#c08a4e")],
              p=[BOX_CX, BOX_MOUTH_Y + 74]),
        group("opening", [rect(0, 0, 148, 26, 4), fill("#33220f")],
              p=[BOX_CX, BOX_MOUTH_Y + 6]),
    ]
    wiggle = anim([
        kf(150, [100, 100, 100], hold=True),
        kf(155, [113, 87, 100], 0.4, 0, 0.6, 1),
        kf(161, [92, 108, 100], 0.4, 0, 0.6, 1),
        kf(167, [104, 96, 100], 0.4, 0, 0.6, 1),
        last(173, [100, 100, 100]),
    ])
    bottom_y = BOX_MOUTH_Y + 136
    return shape_layer(11, "box", items,
                       transform(p=[BOX_CX, bottom_y, 0],
                                 a=[BOX_CX, bottom_y, 0], s=wiggle))


def suction_lines_layer():
    """Curved speed-lines that get swallowed toward the box mouth."""
    lines = [
        smooth_path([[430, 240], [520, 195], [610, 230], [BOX_CX, 370]]),
        smooth_path([[410, 300], [510, 285], [600, 300], [BOX_CX, 375]]),
        smooth_path([[435, 360], [525, 385], [615, 350], [BOX_CX, 378]]),
    ]
    groups = []
    for i, pth in enumerate(lines):
        t0 = 108 + i * 6
        trim_s = anim([kf(t0, 0, 0.5, 0, 0.5, 1), last(t0 + 34, 100)])
        trim_e = anim([kf(t0, 0, 0.3, 0, 0.5, 1), last(t0 + 26, 100)])
        groups.append(group(f"line{i}", [
            path_shape(pth), stroke("#cfe9f5", 5, 70),
            {"ty": "tm", "s": trim_s, "e": trim_e,
             "o": static(0), "m": 1}]))
    opacity = anim([kf(106, 0, hold=True), kf(110, 100, hold=True),
                    kf(150, 100), last(156, 0)])
    return shape_layer(9, "suction", groups, transform(o=opacity),
                       ip=106, op=160)


def poof_layer():
    """Radial burst when the octopus disappears into the box."""
    items = []
    for i in range(7):
        ang = math.pi + i * math.pi / 6 - math.pi / 12  # fan over the box top
        x1, y1 = 26 * math.cos(ang), 26 * math.sin(ang)
        x2, y2 = 52 * math.cos(ang), 52 * math.sin(ang)
        items.append(group(f"spark{i}", [
            path_shape({"i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]],
                        "v": [[x1, y1], [x2, y2]], "c": False}),
            stroke("#fff3d6", 6)]))
    scale = anim([kf(147, [25, 25, 100], 0.3, 0, 0.5, 1),
                  last(162, [150, 150, 100])])
    opacity = anim([kf(147, 0, 0.3, 0, 0.5, 1), kf(151, 100),
                    last(162, 0)])
    return shape_layer(8, "poof", items,
                       transform(p=[BOX_CX, BOX_MOUTH_Y - 6, 0],
                                 s=scale, o=opacity),
                       ip=147, op=164)


def bubbles_layer():
    """Rising bubbles scattered through the scene, plus a burst at the box."""
    specs = [  # (x, y_start, size, t0, dur, drift)
        (120, 480, 14, 5, 55, 18),
        (210, 520, 9, 25, 50, -14),
        (330, 500, 12, 45, 55, 16),
        (430, 470, 8, 65, 45, -12),
        (255, 540, 16, 80, 60, 20),
        (520, 500, 10, 95, 45, -10),
        (BOX_CX - 20, BOX_MOUTH_Y - 10, 9, 150, 32, -16),
        (BOX_CX + 14, BOX_MOUTH_Y - 6, 12, 152, 34, 14),
        (BOX_CX, BOX_MOUTH_Y - 14, 7, 154, 30, 4),
    ]
    groups = []
    for i, (x, y0, sz, t0, dur, drift) in enumerate(specs):
        rise = 130 + sz * 4
        pos = anim([kf(t0, [x, y0], 0.3, 0, 0.6, 1),
                    last(t0 + dur, [x + drift, y0 - rise])])
        op = anim([kf(t0, 0, hold=False), kf(t0 + 6, 75),
                   kf(t0 + dur - 10, 70), last(t0 + dur, 0)])
        groups.append(group(f"bubble{i}", [
            ellipse(0, 0, sz, sz), stroke("#dff1fa", 2.5, 85),
            fill("#dff1fa", 22)], p=pos, o=op))
    return shape_layer(12, "bubbles", groups, transform())


def seaweed_layer():
    """Two swaying plants anchored to the sea floor."""
    def plant(idx, base_x, height, phase, colr, width):
        keys = []
        for t in range(0, OP + 5, 5):
            omega = 2 * math.pi / 60
            pts = []
            for j in range(4):
                wob = [0, 6, 13, 22][j] * math.sin(omega * t + phase + j * 0.8)
                pts.append([base_x + wob, 600 - height * j / 3])
            keys.append({"t": t, "s": [smooth_path(pts)],
                         "o": {"x": [0.33], "y": [0.33]},
                         "i": {"x": [0.67], "y": [0.67]}})
        keys[-1] = {"t": OP, "s": keys[-1]["s"]}
        return group(f"plant{idx}", [path_shape(keys), stroke(colr, width)])

    items = [plant(0, 60, 130, 0.0, "#2e7d5b", 11),
             plant(1, 95, 95, 1.6, "#3a9a70", 9),
             plant(2, 745, 110, 0.9, "#2e7d5b", 10)]
    return shape_layer(13, "seaweed", items, transform())


def sand_layer():
    pth = smooth_path([[0, 585], [200, 570], [420, 588], [640, 572],
                       [800, 584], [800, 600], [0, 600]], closed=True,
                      tension=0.18)
    return shape_layer(14, "sand", [group("sand", [
        path_shape(pth), fill("#caa46a")])], transform())


def light_layer():
    items = [
        group("glow", [ellipse(0, 0, 900, 420), fill("#2a6f97", 45)],
              p=[400, -60]),
        group("ray1", [rect(0, 0, 80, 760), fill("#7fb6d9", 8)],
              p=[250, 280], r=18),
        group("ray2", [rect(0, 0, 50, 760), fill("#7fb6d9", 7)],
              p=[345, 270], r=18),
    ]
    return shape_layer(15, "light", items, transform())


def bg_layer():
    return {"ddd": 0, "ind": 16, "ty": 1, "nm": "water", "sr": 1,
            "ks": transform(p=[W / 2, H / 2, 0], a=[W / 2, H / 2, 0]),
            "ao": 0, "sc": "#10405f", "sw": W, "sh": H,
            "ip": 0, "op": OP, "st": 0, "bm": 0}


# ---------------------------------------------------------------- assemble

doc = {
    "v": "5.9.6", "fr": FR, "ip": 0, "op": OP, "w": W, "h": H,
    "nm": "Octopus sucked into a box", "ddd": 0,
    "assets": [{"id": "octo", "w": OCTO_W, "h": OCTO_H, "fr": FR,
                "layers": octopus_layers()}],
    "layers": [
        poof_layer(),
        suction_lines_layer(),
        octopus_main_layer(),
        box_layer(),
        bubbles_layer(),
        seaweed_layer(),
        sand_layer(),
        light_layer(),
        bg_layer(),
    ],
}

out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "octopus-box.json")
with open(out, "w") as f:
    json.dump(doc, f, separators=(",", ":"))
print(f"wrote {out} ({os.path.getsize(out)} bytes)")
