from PIL import Image, ImageDraw
import os, math

def create_icon(size):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions
    padding = size // 8
    width = size - (2 * padding)
    height = size - (2 * padding)
    
    # Create AI-inspired shield shape
    shield_shape = [
        (padding, padding + height//4),  # Top left
        (padding + width//2, padding),   # Top middle
        (padding + width, padding + height//4),  # Top right
        (padding + width, padding + height * 3//4),  # Bottom right
        (padding + width//2, padding + height),  # Bottom middle
        (padding, padding + height * 3//4),  # Bottom left
    ]
    
    # Draw neural network-inspired background
    for i in range(height):
        y = padding + i
        # Create a cybersecurity-themed gradient
        color = (
            int(41 + (i/height) * 30),   # Deep blue
            int(128 - (i/height) * 20),  # Tech blue
            int(185 - (i/height) * 30),  # Bright blue
            255
        )
        draw.line([(padding, y), (padding + width, y)], fill=color)
    
    # Add neural network nodes
    nodes = []
    for i in range(3):
        for j in range(3):
            x = padding + width * (i + 1) // 4
            y = padding + height * (j + 1) // 4
            nodes.append((x, y))
            draw.ellipse([x-2, y-2, x+2, y+2], fill=(255, 255, 255, 180))
    
    # Connect nodes with lines
    for i, node1 in enumerate(nodes):
        for node2 in nodes[i+1:]:
            draw.line([node1, node2], fill=(255, 255, 255, 50), width=1)
    
    # Draw shield outline with double border
    draw.polygon(shield_shape, outline=(255, 255, 255, 180))
    
    # Draw "K" with AI-inspired design
    emblem_color = (255, 255, 255, 255)
    center_x = size // 2
    center_y = size // 2
    emblem_size = size // 3
    
    # Create circuit-board pattern
    for i in range(4):
        angle = i * math.pi / 2
        x1 = center_x + int(math.cos(angle) * emblem_size/2)
        y1 = center_y + int(math.sin(angle) * emblem_size/2)
        x2 = center_x + int(math.cos(angle + math.pi/4) * emblem_size/2)
        y2 = center_y + int(math.sin(angle + math.pi/4) * emblem_size/2)
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 100))
    
    # Draw modern "K"
    k_points = [
        # Vertical line
        [center_x - emblem_size//4, center_y - emblem_size//2],
        [center_x + emblem_size//4, center_y - emblem_size//2],
        [center_x + emblem_size//4, center_y + emblem_size//2],
        [center_x - emblem_size//4, center_y + emblem_size//2],
        # Upper diagonal
        [center_x, center_y - emblem_size//6],
        [center_x + emblem_size//2, center_y - emblem_size//2],
        # Lower diagonal
        [center_x, center_y + emblem_size//6],
        [center_x + emblem_size//2, center_y + emblem_size//2],
    ]
    
    for point in k_points[:4]:
        draw.rectangle([point[0]-1, point[1]-1, point[0]+1, point[1]+1], fill=emblem_color)
    draw.polygon(k_points[4:6] + k_points[6:8], fill=emblem_color)
    
    # Add AI-inspired glow effect
    glow_points = []
    for i in range(8):
        angle = i * math.pi / 4
        x = center_x + int(math.cos(angle) * emblem_size/1.5)
        y = center_y + int(math.sin(angle) * emblem_size/1.5)
        glow_points.append((x, y))
        draw.arc([x-2, y-2, x+2, y+2], 0, 360, fill=(255, 255, 255, 40))
    
    # Add security-themed elements
    lock_size = size // 8
    draw.rectangle([
        center_x - lock_size//2,
        center_y + emblem_size//2 - lock_size,
        center_x + lock_size//2,
        center_y + emblem_size//2
    ], outline=(255, 255, 255, 100))
    
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