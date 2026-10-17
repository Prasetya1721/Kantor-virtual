from PIL import Image, ImageFilter, ImageEnhance
konten = "/opt/data/workspace/Kantor-virtual/data/shopee-studio/konten-002-skintific"
botol = Image.open(f"{konten}/aset/botol-asli.jpg").convert("RGB")

w, h = botol.size
target_w, target_h = 720, 1280
scale = target_w / w
bw, bh = int(w*scale), int(h*scale)
base = botol.resize((bw, bh), Image.LANCZOS)
# kanvas vertikal: latar = foto asli di-blur & digelapkan (produk fokus di tengah)
canvas = botol.resize((target_h, target_h), Image.LANCZOS).resize((target_w, target_h))
canvas = canvas.filter(ImageFilter.GaussianBlur(18))
canvas = ImageEnhance.Brightness(canvas).enhance(0.75)
px = (target_w - bw)//2
py = (target_h - bh)//2
canvas.paste(base, (px, py))
canvas.save(f"{konten}/storyboard/hero-1.jpg", quality=92)
print("hero-1 OK (full frame, latar blur dari foto asli)")

# Hero 2: close-up label
cw, ch = 900, 1600
cx = (w - cw)//2
cy = int(h*0.25)
hero2 = botol.crop((cx, cy, cx+cw, cy+ch)).resize((720, 1280), Image.LANCZOS)
hero2.save(f"{konten}/storyboard/hero-2.jpg", quality=92)
print("hero-2 OK (close-up label)")

# Hero 3: close-up pompa
cy2 = int(h*0.02)
hero3 = botol.crop((cx, cy2, cx+cw, cy2+ch)).resize((720, 1280), Image.LANCZOS)
hero3.save(f"{konten}/storyboard/hero-3.jpg", quality=92)
print("hero-3 OK (close-up pompa)")
