"""Render the code-native Grimoire XR heptagram as PWA launcher PNGs."""

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SCALE = 4
SIZE = 128


def px(value):
    return round(value)


canvas = Image.new("RGBA", (SIZE, SIZE), "#020102")
draw = ImageDraw.Draw(canvas)
draw.rectangle((8, 8, 119, 119), fill="#180509")
draw.rectangle((12, 12, 115, 115), fill="#020102")

corner = "#ef233c"
for points in [
    ((12, 12), (44, 16)), ((12, 12), (16, 44)),
    ((84, 12), (116, 16)), ((112, 12), (116, 44)),
    ((12, 112), (44, 116)), ((12, 84), (16, 116)),
    ((84, 112), (116, 116)), ((112, 84), (116, 116)),
]:
    draw.rectangle((*points[0], *points[1]), fill=corner)

center = (64, 59)
draw.ellipse((21, 16, 107, 102), outline="#8d1728", width=4)
draw.ellipse((26, 21, 102, 97), outline="#b8860b", width=1)

points = []
for index in range(7):
    angle = -pi / 2 + index * (2 * pi / 7)
    points.append((px(center[0] + cos(angle) * 36), px(center[1] + sin(angle) * 36)))
order = [0, 3, 6, 2, 5, 1, 4, 0]
draw.line([points[index] for index in order], fill="#e5c158", width=4, joint="curve")
draw.line([points[index] for index in reversed(order)], fill="#ef233c", width=1, joint="curve")

draw.rectangle((40, 96, 88, 116), fill="#020102", outline="#35c6b4", width=2)
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
try:
    font = ImageFont.truetype(font_path, 14)
except OSError:
    font = ImageFont.load_default()
label = "93"
box = draw.textbbox((0, 0), label, font=font)
draw.text(((SIZE - (box[2] - box[0])) / 2, 98), label, fill="#e5c158", font=font)

large = canvas.resize((512, 512), Image.Resampling.NEAREST)
large.save(PUBLIC / "grimoire-icon-512.png", optimize=True)
large.resize((192, 192), Image.Resampling.NEAREST).save(PUBLIC / "grimoire-icon-192.png", optimize=True)
