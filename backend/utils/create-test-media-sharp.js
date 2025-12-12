const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TEST_IMAGES_DIR = path.join(__dirname, '../../data/test-images');

async function createTestImage(filename, width, height, text, bgColor, textColor) {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${bgColor}"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
                  fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
                ${text.split('\n').map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 80}">${line}</tspan>`).join('')}
            </text>
        </svg>
    `;
    
    const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
    
    return buffer;
}

async function createTestImages() {
    console.log('Creating test images with Sharp...');
    
    const directories = {
        'daily-plan/Morning': [
            { name: 'morning-schedule-1.png', text: 'Morning Schedule\n06:30-14:29', bg: '#FFE082', color: '#1a237e' },
            { name: 'morning-schedule-2.png', text: 'Morning Plan', bg: '#FFCC80', color: '#1a237e' }
        ],
        'daily-plan/Evening': [
            { name: 'evening-schedule-1.png', text: 'Evening Schedule\n14:30-22:29', bg: '#90CAF9', color: '#1a237e' },
            { name: 'evening-schedule-2.png', text: 'Evening Plan', bg: '#64B5F6', color: '#1a237e' }
        ],
        'daily-plan/Night': [
            { name: 'night-schedule-1.png', text: 'Night Schedule\n22:30-06:29', bg: '#7986CB', color: '#ffffff' },
            { name: 'night-schedule-2.png', text: 'Night Plan', bg: '#5C6BC0', color: '#ffffff' }
        ],
        'gallery/folder1': [
            { name: 'image-1.png', text: 'Gallery Image 1', bg: '#F48FB1', color: '#1a237e' },
            { name: 'image-2.png', text: 'Gallery Image 2', bg: '#CE93D8', color: '#1a237e' },
            { name: 'image-3.png', text: 'Gallery Image 3', bg: '#A5D6A7', color: '#1a237e' },
            { name: 'image-4.png', text: 'Gallery Image 4', bg: '#FFCC80', color: '#1a237e' }
        ],
        'gallery/folder2': [
            { name: 'photo-1.png', text: 'Photo 1', bg: '#EF5350', color: '#ffffff' },
            { name: 'photo-2.png', text: 'Photo 2', bg: '#42A5F5', color: '#ffffff' },
            { name: 'photo-3.png', text: 'Photo 3', bg: '#66BB6A', color: '#ffffff' }
        ],
        'kpi/kpi1': [
            { name: 'kpi-card-1.png', text: 'KPI Card 1\nPerformance', bg: '#667eea', color: '#ffffff' },
            { name: 'kpi-card-2.png', text: 'KPI Card 2\nMetrics', bg: '#764ba2', color: '#ffffff' }
        ],
        'kpi/kpi2': [
            { name: 'dashboard-kpi-1.png', text: 'Dashboard KPI 1', bg: '#4facfe', color: '#ffffff' },
            { name: 'dashboard-kpi-2.png', text: 'Dashboard KPI 2', bg: '#00f2fe', color: '#1a237e' }
        ]
    };
    
    let created = 0;
    
    for (const [dir, files] of Object.entries(directories)) {
        const dirPath = path.join(TEST_IMAGES_DIR, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file.name);
                const imageBuffer = await createTestImage(1920, 1080, file.text, file.bg, file.color);
                fs.writeFileSync(filePath, imageBuffer);
                created++;
                console.log(`✅ Created: ${dir}/${file.name}`);
            } catch (error) {
                console.error(`❌ Error creating ${dir}/${file.name}:`, error.message);
            }
        }
    }
    
    console.log(`\n✅ Created ${created} test images!`);
    return created;
}

if (require.main === module) {
    createTestImages().catch(error => {
        console.error('Error creating test images:', error);
        process.exit(1);
    });
}

module.exports = { createTestImages };

