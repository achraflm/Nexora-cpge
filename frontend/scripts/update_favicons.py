import base64
from PIL import Image

# Generate 32x32 icon files
img = Image.open('public/nexora-logo.png')
icon32 = img.resize((32, 32), Image.Resampling.LANCZOS)
icon32.save('public/icon-light-32x32.png')
icon32.save('public/icon-dark-32x32.png')

with open('public/nexora-logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('ascii')

svg_content = f'''<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="36" fill="#0b162c" />
  <image href="data:image/png;base64,{b64}" x="18" y="18" width="144" height="144" />
</svg>'''

with open('public/icon.svg', 'w') as f:
    f.write(svg_content)

print('Updated public/icon.svg and favicon png files successfully!')
