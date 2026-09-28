import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_white_bg(img_path):
    print(f"Processing {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # If the pixel is close to white, make it transparent
        # R, G, B > 240 is considered white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print(f"Done processing {img_path}")

images = ["icon.png", "splash-icon.png", "android-icon-foreground.png"]

for image in images:
    try:
        remove_white_bg(image)
    except Exception as e:
        print(f"Error processing {image}: {e}")
