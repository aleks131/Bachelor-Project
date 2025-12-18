# Sequence Diagram: Real-Time File Update

## Scenario: User Adds New Image to Network Folder

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │    │ Network │    │ Chokidar │    │ Node.js  │    │  Sharp   │    │ WebSocket│    │ Browser │
│          │    │  Drive  │    │  Watcher │    │ Controller│    │ Processor│    │  Server  │    │         │
└────┬─────┘    └────┬────┘    └────┬────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │               │              │               │               │               │
     │ 1. Add File   │               │              │               │               │               │
     │───────────────>│               │              │               │               │               │
     │               │               │              │               │               │               │
     │               │ 2. File Added │              │               │               │               │
     │               │──────────────>│              │               │               │               │
     │               │               │              │               │               │               │
     │               │               │ 3. 'add' Event              │               │               │
     │               │               │──────────────>               │               │               │
     │               │               │              │               │               │               │
     │               │               │              │ 4. Process File Metadata      │               │
     │               │               │              │───────────────>               │               │
     │               │               │              │               │               │               │
     │               │               │              │ 5. Check File Type            │               │
     │               │               │              │───────────────>               │               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 6. Is Image?  │               │
     │               │               │              │               │<──────────────               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 7. Yes: Optimize              │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 8. Resize to 1920x1080        │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 9. Convert to WebP            │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 10. Generate Thumbnail        │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 11. Save to Cache             │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │ 12. Cache Path Returned        │               │
     │               │               │              │<───────────────               │               │
     │               │               │              │               │               │               │
     │               │               │              │ 13. Prepare Update Event       │               │
     │               │               │              │───────────────>               │               │
     │               │               │              │               │               │               │
     │               │               │              │               │ 14. Broadcast to Clients      │
     │               │               │              │               │───────────────>               │
     │               │               │              │               │               │               │
     │               │               │              │               │               │ 15. Send Update│
     │               │               │              │               │               │───────────────>│
     │               │               │              │               │               │               │
     │               │               │              │               │               │               │ 16. Receive Event
     │               │               │              │               │               │               │<───────────────
     │               │               │              │               │               │               │
     │               │               │              │               │               │               │ 17. Update DOM
     │               │               │              │               │               │               │───────────────>
     │               │               │              │               │               │               │
     │               │               │              │               │               │               │ 18. Display New File
     │               │               │              │               │               │               │───────────────>
     │               │               │              │               │               │               │
```

## Detailed Flow Description

### Step 1-2: File Addition
**User** adds a new image file to the network drive folder.
**Network Drive** stores the file and triggers file system events.

### Step 3: Event Detection
**Chokidar Watcher** detects the 'add' event for the new file.
Event includes: file path, file type, timestamp.

### Step 4-5: Metadata Processing
**Node.js Controller** receives the event and processes file metadata:
- File path
- File size
- File type (extension)
- Modification date

### Step 6-11: Image Processing
**Sharp Processor** performs optimization:
1. Checks if file is an image
2. Analyzes image dimensions
3. Resizes if larger than 1920x1080
4. Converts format to WebP (if needed)
5. Generates thumbnail (200x200)
6. Saves optimized versions to cache

### Step 12-13: Update Preparation
**Node.js Controller** prepares update event with:
- File path
- Thumbnail path
- Optimized image path
- File metadata
- Event type ('file_added')

### Step 14-15: Broadcasting
**WebSocket Server** broadcasts the update event to all connected clients.
Uses efficient message format (JSON).

### Step 16-18: Client Update
**Browser** receives the WebSocket message:
1. Parses the update event
2. Updates DOM without page refresh
3. Displays new file in gallery/list
4. Shows thumbnail if available

## Code Implementation

### Chokidar Watcher Setup
```javascript
// backend/routes/gallery.js
const chokidar = require('chokidar');

function setupGalleryWatcher(path, wss) {
    const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    });
    
    watcher.on('add', (filePath) => {
        processFileAdded(filePath, wss);
    });
    
    return watcher;
}
```

### File Processing
```javascript
async function processFileAdded(filePath, wss) {
    const metadata = await getFileMetadata(filePath);
    
    if (isImage(filePath)) {
        const optimized = await optimizeImage(filePath);
        const thumbnail = await generateThumbnail(filePath);
        
        broadcastUpdate(wss, {
            type: 'file_added',
            path: filePath,
            optimized: optimized,
            thumbnail: thumbnail,
            metadata: metadata
        });
    }
}
```

### WebSocket Broadcast
```javascript
function broadcastUpdate(wss, data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
```

### Frontend Update Handler
```javascript
// frontend/scripts/gallery.js
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'file_added') {
        addFileToGallery(data);
        showNotification('New file added: ' + data.path);
    }
};
```

## Timing Analysis

- **File Addition**: ~10ms (network drive write)
- **Event Detection**: ~50ms (Chokidar processing)
- **Metadata Processing**: ~20ms (file system read)
- **Image Optimization**: ~200-500ms (depends on image size)
- **WebSocket Broadcast**: ~5ms (message sending)
- **DOM Update**: ~10ms (JavaScript execution)

**Total Time**: ~300-600ms from file addition to display

## Benefits of Event-Driven Architecture

1. **Real-Time Updates**: Changes appear instantly
2. **Efficient**: No polling overhead
3. **Scalable**: Handles multiple files simultaneously
4. **Resource Efficient**: Low CPU/memory usage
5. **Reliable**: Event-driven is more reliable than polling

---

**Purpose**: This sequence diagram demonstrates the event-driven architecture and proves understanding of real-time update mechanisms, showing how file changes trigger a cascade of processing steps that result in instant UI updates.


