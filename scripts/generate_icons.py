from PIL import Image, ImageDraw
import os

def create_icon(size):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a filled circle for the background
    draw.ellipse([0, 0, size-1, size-1], fill='#3498db')
    
    return img

def main():
    # Ensure assets directory exists
    if not os.path.exists('assets'):
        os.makedirs('assets')
    
    # Generate icons in different sizes
    sizes = [16, 48, 128]
    
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'assets/icon{size}.png', 'PNG')
        print(f'Created icon{size}.png')

if __name__ == '__main__':
    main() 