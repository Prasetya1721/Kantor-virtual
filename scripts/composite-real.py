
import argparse
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageStat
import numpy as np

def crop_to_content(img):
    a = np.array(img)[:, :, 3]
    ys, xs = np.where(a > 60)
    pad = 8
    return img.crop((max(0, xs.min()-pad), max(0, ys.min()-pad),
                     min(img.width, xs.max()+pad), min(img.height, ys.max()+pad)))

def light_direction(scene):
    """Kuadran paling terang → arah cahaya. Return offset shadow (dx)."""
    g = scene.convert("L")
    w, h = g.size
    quads = {
        "left":  ImageStat.Stat(g.crop((0, 0, w//3, h))).mean[0],
        "right": ImageStat.Stat(g.crop((2*w//3, 0, w, h))).mean[0],
    }
    return -1 if quads["left"] > quads["right"] else 1  # cahaya kiri → shadow kanan

def match_tone(product, scene, strength=0.5):
    scene_rgb = scene.convert("RGB")
    mid = scene_rgb.crop((scene.width//4, scene.height//4, 3*scene.width//4, 3*scene.height//4))
    s = ImageStat.Stat(mid)
    p = product.convert("RGB")
    ps = ImageStat.Stat(p)
    scale = (s.mean[0]+s.mean[1]+s.mean[2]) / max(1, ps.mean[0]+ps.mean[1]+ps.mean[2])
    scale = 1 + (scale - 1) * strength
    scale = max(0.75, min(1.3, scale))
    p = ImageEnhance.Brightness(p).enhance(scale)
    p.putalpha(product.getchannel("A"))
    return p

def feather_alpha(prod, radius=3):
    a = prod.getchannel("A").filter(ImageFilter.GaussianBlur(radius))
    out = prod.copy()
    out.putalpha(a)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", required=True)
    ap.add_argument("--product", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--scale", type=float, default=0.5)
    ap.add_argument("--pos-y", type=float, default=0.38)
    args = ap.parse_args()

    scene = Image.open(args.scene).convert("RGBA")
    product = Image.open(args.product).convert("RGBA")
    product = crop_to_content(product)

    target_h = int(scene.height * args.scale)
    target_w = int(product.width * target_h / product.height)
    prod = product.resize((target_w, target_h), Image.LANCZOS)
    prod = match_tone(prod, scene)
    prod = feather_alpha(prod, 3)  # tepi menyatu dengan DoF latar

    x = (scene.width - target_w) // 2
    y = int(scene.height * args.pos_y)
    foot_y = y + target_h

    # shadow halus: satu ellipse sangat blur, opacity rendah, geser ikut arah cahaya
    dx = light_direction(scene) * int(target_w * 0.25)
    shadow = Image.new("RGBA", scene.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    ell_w = int(target_w * 1.5)
    sd.ellipse((x + target_w//2 - ell_w//2 + dx, foot_y - int(target_h*0.015),
                x + target_w//2 + ell_w//2 + dx, foot_y + int(target_h*0.04)),
               fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    scene = Image.alpha_composite(scene, shadow)

    scene.paste(prod, (x, y), prod.getchannel("A"))
    scene.convert("RGB").save(args.out, quality=92)
    print(f"saved {args.out}")

main()
