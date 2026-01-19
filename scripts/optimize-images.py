#!/usr/bin/env python3
"""
Image Optimization Script for WIRO 4x4
Compresses, resizes, and converts images to WebP format with JPEG fallback
"""

import os
import sys
from PIL import Image
from pathlib import Path

# Configuration
INPUT_DIR = Path("client/public/images")
OUTPUT_DIR = Path("client/public/images/optimized")
WEBP_QUALITY = 82  # High quality WebP
JPEG_QUALITY = 85  # Fallback JPEG quality

# Size presets
SIZES = {
    "hero": 1920,      # Hero images
    "large": 1200,     # Large tour images
    "medium": 800,     # Medium images
    "small": 400,      # Thumbnails
}

def optimize_image(input_path, output_dir, max_width=1200):
    """
    Optimize a single image: resize, compress, and convert to WebP + JPEG
    """
    try:
        # Open image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Calculate new dimensions
        width, height = img.size
        if width > max_width:
            ratio = max_width / width
            new_width = max_width
            new_height = int(height * ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"  Resized from {width}x{height} to {new_width}x{new_height}")
        
        # Get filename without extension
        filename_stem = input_path.stem
        
        # Save as WebP
        webp_path = output_dir / f"{filename_stem}.webp"
        img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        webp_size = webp_path.stat().st_size / 1024
        
        # Save as JPEG (fallback)
        jpeg_path = output_dir / f"{filename_stem}.jpg"
        img.save(jpeg_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
        jpeg_size = jpeg_path.stat().st_size / 1024
        
        # Get original size
        original_size = input_path.stat().st_size / 1024
        
        # Calculate savings
        webp_savings = ((original_size - webp_size) / original_size) * 100
        jpeg_savings = ((original_size - jpeg_size) / original_size) * 100
        
        print(f"  Original: {original_size:.1f} KB")
        print(f"  WebP: {webp_size:.1f} KB ({webp_savings:.1f}% smaller)")
        print(f"  JPEG: {jpeg_size:.1f} KB ({jpeg_savings:.1f}% smaller)")
        
        return {
            'filename': input_path.name,
            'original_size': original_size,
            'webp_size': webp_size,
            'jpeg_size': jpeg_size,
            'webp_savings': webp_savings,
            'jpeg_savings': jpeg_savings
        }
        
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    """Main optimization function"""
    print("=" * 60)
    print("WIRO 4x4 Image Optimization Script")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get all images
    image_extensions = ('.jpg', '.jpeg', '.png')
    images = [f for f in INPUT_DIR.glob('*') if f.suffix.lower() in image_extensions]
    
    if not images:
        print(f"No images found in {INPUT_DIR}")
        return
    
    print(f"\nFound {len(images)} images to optimize\n")
    
    # Track statistics
    results = []
    total_original = 0
    total_webp = 0
    total_jpeg = 0
    
    # Process each image
    for i, img_path in enumerate(images, 1):
        print(f"[{i}/{len(images)}] Processing: {img_path.name}")
        
        # Determine size based on filename
        if 'hero' in img_path.name.lower():
            max_width = SIZES['hero']
        elif any(x in img_path.name for x in ['1000000149', 'laos_jungle', 'vietnam_rice']):
            max_width = SIZES['large']
        else:
            max_width = SIZES['medium']
        
        result = optimize_image(img_path, OUTPUT_DIR, max_width)
        
        if result:
            results.append(result)
            total_original += result['original_size']
            total_webp += result['webp_size']
            total_jpeg += result['jpeg_size']
        
        print()
    
    # Print summary
    print("=" * 60)
    print("OPTIMIZATION SUMMARY")
    print("=" * 60)
    print(f"Images processed: {len(results)}")
    print(f"Total original size: {total_original:.1f} KB ({total_original/1024:.2f} MB)")
    print(f"Total WebP size: {total_webp:.1f} KB ({total_webp/1024:.2f} MB)")
    print(f"Total JPEG size: {total_jpeg:.1f} KB ({total_jpeg/1024:.2f} MB)")
    print(f"\nWebP savings: {((total_original - total_webp) / total_original * 100):.1f}%")
    print(f"JPEG savings: {((total_original - total_jpeg) / total_original * 100):.1f}%")
    print(f"\nOptimized images saved to: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
