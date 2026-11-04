import os
import math
from PIL import Image, ImageFilter, ImageEnhance

# Source image
src_path = '776c407a-1115-49ca-852e-bf62284c071a.png'
if not os.path.exists(src_path):
    print(f'Error: {src_path} not found')
    exit(1)

img = Image.open(src_path).convert('RGBA')
w, h = img.size
bg_color = (10.5, 17.5, 35.5)

# 1. Create transparent alpha mask
pixels = img.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Euclidean distance to background color
        dr = r - bg_color[0]
        dg = g - bg_color[1]
        db = b - bg_color[2]
        dist = math.sqrt(dr*dr + dg*dg + db*db)
        
        # Color boost for blue/cyan
        is_blue_or_cyan = (b > r + 30) or (g > 130 and b > 140)
        
        if dist < 22:
            pixels[x, y] = (0, 0, 0, 0)
        elif dist < 42:
            # Smooth anti-aliased edge
            alpha_factor = (dist - 22) / 20.0
            new_a = int(255 * alpha_factor)
            # Remove dark spill
            pixels[x, y] = (min(255, int(r * 1.3)), min(255, int(g * 1.3)), min(255, int(b * 1.3)), new_a)
        else:
            # Enhance vibrancy of logo
            if is_blue_or_cyan:
                pixels[x, y] = (r, g, min(255, int(b * 1.08)), 255)

# Find bounding box of visible pixels
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
else:
    cropped = img

cw, ch = cropped.size
print(f'Cropped size: {cw}x{ch}')

# Target high-resolution canvas 512x512
target_size = 512
canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))

# Scale cropped to fit 82% of target size (around 420px)
scale = 420.0 / max(cw, ch)
new_w = int(cw * scale)
new_h = int(ch * scale)
resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

# Paste centered
pos_x = (target_size - new_w) // 2
pos_y = (target_size - new_h) // 2
canvas.paste(resized, (pos_x, pos_y), resized)

# Output paths
os.makedirs('public', exist_ok=True)
transparent_out = 'public/nexora-logo.png'
canvas.save(transparent_out, 'PNG', optimize=True)
print(f'Saved transparent logo to {transparent_out}')

# Also save square dark navy badge version (for icons/favicons/apple-touch)
dark_bg = Image.new('RGBA', (target_size, target_size), (16, 27, 51, 255))
dark_bg.paste(canvas, (0, 0), canvas)
dark_out = 'public/nexora-logo-dark.png'
dark_bg.save(dark_out, 'PNG', optimize=True)
print(f'Saved dark badge logo to {dark_out}')

# Favicon 64x64 and 32x32
icon_64 = canvas.resize((64, 64), Image.Resampling.LANCZOS)
icon_64.save('public/icon.png', 'PNG')

# Copy original as backup
import shutil
shutil.copyfile(src_path, 'public/original-logo.png')
print('Enhanced logo generation complete!')
