# Activity Diagram: Smart Image Optimization

## Flow: Image Optimization Process

```
                    ┌─────────┐
                    │  START  │
                    └────┬────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Receive Image File  │
              └────┬─────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Check File Type    │
         └────┬────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Is Image File?    │
    └───┬─────────────┬───┘
        │             │
       YES           NO
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Process Image│  │ Skip Process │
│              │  │ (Copy as-is) │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 │
       ▼                 │
┌─────────────────────┐  │
│ Analyze Dimensions  │  │
│ (Width x Height)    │  │
└────┬────────────────┘  │
     │                   │
     ▼                   │
┌─────────────────────┐  │
│ Get Screen          │  │
│ Resolution          │  │
│ (Default: 1920x1080)│  │
└────┬────────────────┘  │
     │                   │
     ▼                   │
┌─────────────────────┐  │
│ Compare Dimensions  │  │
│ Image > Screen?     │  │
└───┬─────────────┬───┘  │
    │             │      │
   YES           NO       │
    │             │       │
    ▼             │       │
┌──────────────┐  │       │
│ Resize Image │  │       │
│ to Screen    │  │       │
│ Resolution   │  │       │
└────┬─────────┘  │       │
     │            │       │
     ▼            │       │
┌──────────────┐  │       │
│ Check Format │  │       │
│ (PNG/JPG?)   │  │       │
└───┬──────────┘  │       │
    │             │       │
   YES           NO       │
    │             │       │
    ▼             │       │
┌──────────────┐  │       │
│ Convert to   │  │       │
│ WebP Format  │  │       │
└────┬─────────┘  │       │
     │            │       │
     │            │       │
     ▼            ▼       ▼
┌─────────────────────────────┐
│  Generate Thumbnail         │
│  (200x200, WebP, Quality 80)│
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────┐
│  Save to Cache      │
│  - Optimized Image  │
│  - Thumbnail        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Return Cache Paths │
│  - /image-cache/... │
│  - /thumbnails/...  │
└────┬────────────────┘
     │
     ▼
┌─────────┐
│   END   │
└─────────┘
```

## Decision Points

### Decision 1: Is Image File?
**Check**: File extension (.jpg, .jpeg, .png, .gif, .webp, .bmp)
- **YES**: Continue to image processing
- **NO**: Skip optimization, copy file as-is

### Decision 2: Image > Screen Resolution?
**Check**: Image dimensions vs screen resolution (1920x1080)
- **YES**: Resize to fit screen (maintain aspect ratio)
- **NO**: Use original size (no resizing needed)

### Decision 3: Format Conversion Needed?
**Check**: Current format (PNG, JPG) vs target format (WebP)
- **YES**: Convert to WebP (better compression)
- **NO**: Keep original format

## Processing Steps

### Step 1: File Type Detection
```javascript
function isImageFile(filePath) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const ext = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(ext);
}
```

### Step 2: Dimension Analysis
```javascript
async function analyzeDimensions(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
    };
}
```

### Step 3: Screen Resolution Check
```javascript
function getScreenResolution() {
    return {
        width: 1920,
        height: 1080
    };
}
```

### Step 4: Resize Decision
```javascript
function needsResize(imageDims, screenDims) {
    return imageDims.width > screenDims.width || 
           imageDims.height > screenDims.height;
}
```

### Step 5: Image Optimization
```javascript
async function optimizeImage(inputPath, outputPath, maxDimension) {
    await sharp(inputPath)
        .resize(maxDimension, maxDimension, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
}
```

### Step 6: Thumbnail Generation
```javascript
async function generateThumbnail(inputPath, outputPath) {
    await sharp(inputPath)
        .resize(200, 200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
}
```

## Performance Metrics

### Optimization Results
- **4K Image (3840x2160)**: 
  - Original: ~8MB PNG
  - Optimized: ~500KB WebP (94% reduction)
  - Thumbnail: ~15KB WebP

- **1080p Image (1920x1080)**:
  - Original: ~2MB JPG
  - Optimized: ~200KB WebP (90% reduction)
  - Thumbnail: ~10KB WebP

### Processing Time
- **Small Image (< 1MB)**: ~100-200ms
- **Medium Image (1-5MB)**: ~200-500ms
- **Large Image (> 5MB)**: ~500-1000ms

### Bandwidth Savings
- **Before Optimization**: 8MB per image load
- **After Optimization**: 500KB per image load
- **Savings**: ~94% reduction in bandwidth

## Cache Strategy

### Cache Structure
```
data/
├── image-cache/
│   ├── image_1920x1080_abc123.webp
│   └── image_1920x1080_def456.webp
└── thumbnails/
    ├── image_200x200_abc123.webp
    └── image_200x200_def456.webp
```

### Cache Key Generation
```javascript
function generateCacheKey(filePath, dimensions, quality) {
    const stats = fs.statSync(filePath);
    const hash = crypto.createHash('md5')
        .update(filePath + stats.mtime + dimensions + quality)
        .digest('hex');
    return `${hash}_${dimensions}.webp`;
}
```

### Cache Hit/Miss Logic
```javascript
async function getOptimizedImage(filePath) {
    const cacheKey = generateCacheKey(filePath, '1920x1080', 85);
    const cachedPath = path.join(cacheDir, cacheKey);
    
    if (fs.existsSync(cachedPath)) {
        return cachedPath; // Cache hit
    }
    
    // Cache miss - optimize and cache
    await optimizeImage(filePath, cachedPath, 1920);
    return cachedPath;
}
```

## Benefits for Raspberry Pi

### Resource Optimization
- **CPU**: Reduced processing (pre-processed images)
- **Memory**: Smaller images use less RAM
- **Storage**: Efficient cache management
- **Network**: Less bandwidth usage

### Performance Improvements
- **Faster Loading**: Cached images load instantly
- **Smoother Scrolling**: Smaller file sizes
- **Better UX**: No waiting for large images
- **Lower Power**: Less processing = less power consumption

---

**Purpose**: This activity diagram explains the performance optimization strategy for low-power devices like the Raspberry Pi, demonstrating how images are intelligently processed to reduce resource usage while maintaining quality.


