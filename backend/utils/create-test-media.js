const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const TEST_IMAGES_DIR = path.join(__dirname, '../../data/test-images');

function createTestImage(filename, width, height, text, bgColor, textColor) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    const buffer = canvas.toBuffer('image/png');
    return buffer;
}

function createTestImages() {
    console.log('Creating test images...');
    
    const directories = {
        'daily-plan/Morning': [
            { name: 'morning-schedule-1.png', text: 'Morning\nSchedule\n06:30-14:29', bg: '#FFE082', color: '#1a237e' },
            { name: 'morning-schedule-2.png', text: 'Morning\nPlan', bg: '#FFCC80', color: '#1a237e' }
        ],
        'daily-plan/Evening': [
            { name: 'evening-schedule-1.png', text: 'Evening\nSchedule\n14:30-22:29', bg: '#90CAF9', color: '#1a237e' },
            { name: 'evening-schedule-2.png', text: 'Evening\nPlan', bg: '#64B5F6', color: '#1a237e' }
        ],
        'daily-plan/Night': [
            { name: 'night-schedule-1.png', text: 'Night\nSchedule\n22:30-06:29', bg: '#7986CB', color: '#ffffff' },
            { name: 'night-schedule-2.png', text: 'Night\nPlan', bg: '#5C6BC0', color: '#ffffff' }
        ],
        'gallery/folder1': [
            { name: 'image-1.png', text: 'Gallery\nImage 1', bg: '#F48FB1', color: '#1a237e' },
            { name: 'image-2.png', text: 'Gallery\nImage 2', bg: '#CE93D8', color: '#1a237e' },
            { name: 'image-3.png', text: 'Gallery\nImage 3', bg: '#A5D6A7', color: '#1a237e' },
            { name: 'image-4.png', text: 'Gallery\nImage 4', bg: '#FFCC80', color: '#1a237e' }
        ],
        'gallery/folder2': [
            { name: 'photo-1.png', text: 'Photo 1', bg: '#EF5350', color: '#ffffff' },
            { name: 'photo-2.png', text: 'Photo 2', bg: '#42A5F5', color: '#ffffff' },
            { name: 'photo-3.png', text: 'Photo 3', bg: '#66BB6A', color: '#ffffff' }
        ],
        'kpi/kpi1': [
            { name: 'kpi-card-1.png', text: 'KPI\nCard 1\nPerformance', bg: '#667eea', color: '#ffffff' },
            { name: 'kpi-card-2.png', text: 'KPI\nCard 2\nMetrics', bg: '#764ba2', color: '#ffffff' }
        ],
        'kpi/kpi2': [
            { name: 'dashboard-kpi-1.png', text: 'Dashboard\nKPI 1', bg: '#4facfe', color: '#ffffff' },
            { name: 'dashboard-kpi-2.png', text: 'Dashboard\nKPI 2', bg: '#00f2fe', color: '#1a237e' }
        ]
    };
    
    let created = 0;
    
    for (const [dir, files] of Object.entries(directories)) {
        const dirPath = path.join(TEST_IMAGES_DIR, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file.name);
            const imageBuffer = createTestImage(1920, 1080, file.text, file.bg, file.color);
            fs.writeFileSync(filePath, imageBuffer);
            created++;
            console.log(`✅ Created: ${dir}/${file.name}`);
        });
    }
    
    console.log(`\n✅ Created ${created} test images!`);
    return created;
}

if (require.main === module) {
    try {
        createTestImages();
    } catch (error) {
        console.error('Error creating test images:', error);
        console.log('\n💡 Note: Canvas package required. Install with: npm install canvas');
    }
}

module.exports = { createTestImages };

