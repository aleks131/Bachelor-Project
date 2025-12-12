const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MOCKUPS_DIR = path.join(__dirname, '../../mockups');

async function createMockupImage(filename, width, height, content) {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1d29;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#1e1e2e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#252538;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#2a2a3e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1f1f2e;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgGrad)"/>
            ${content}
        </svg>
    `;
    
    const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
    
    return buffer;
}

async function createMockups() {
    console.log('Creating mockup images...');
    
    if (!fs.existsSync(MOCKUPS_DIR)) {
        fs.mkdirSync(MOCKUPS_DIR, { recursive: true });
    }
    
    // 1. Login Screen Mockup
    const loginContent = `
        <rect y="0" width="1920" height="120" fill="url(#headerGrad)"/>
        <text x="960" y="60" font-family="Arial" font-size="24" font-weight="bold" fill="#667eea" text-anchor="middle">Smart Solutions by TripleA</text>
        
        <rect x="760" y="200" width="400" height="500" rx="20" fill="url(#cardGrad)" stroke="#667eea" stroke-width="2"/>
        <text x="960" y="280" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">Login</text>
        
        <rect x="800" y="330" width="320" height="50" rx="8" fill="#1a1d29" stroke="#667eea" stroke-width="1"/>
        <text x="820" y="360" font-family="Arial" font-size="14" fill="#888">Username</text>
        
        <rect x="800" y="400" width="320" height="50" rx="8" fill="#1a1d29" stroke="#667eea" stroke-width="1"/>
        <text x="820" y="430" font-family="Arial" font-size="14" fill="#888">Password</text>
        
        <rect x="800" y="480" width="320" height="50" rx="12" fill="url(#btnGrad)"/>
        <text x="960" y="510" font-family="Arial" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">LOGIN</text>
    `;
    const loginBuffer = await createMockupImage('login-screen.png', 1920, 1080, loginContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'login-screen.png'), loginBuffer);
    console.log('✅ Created: login-screen.png');
    
    // 2. Dashboard Mockup
    const dashboardContent = `
        <rect y="0" width="1920" height="90" fill="url(#headerGrad)"/>
        <text x="100" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="#667eea">TripleA Logo</text>
        <text x="1700" y="55" font-family="Arial" font-size="14" fill="#fff">Welcome, Admin</text>
        <rect x="1750" y="30" width="120" height="35" rx="8" fill="#ff6b6b"/>
        <text x="1810" y="52" font-family="Arial" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">LOGOUT</text>
        
        <rect x="100" y="150" width="400" height="500" rx="20" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="300" y="220" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">📊</text>
        <text x="300" y="280" font-family="Arial" font-size="28" font-weight="bold" fill="#667eea" text-anchor="middle">Daily Plan</text>
        <text x="300" y="320" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">View daily plans</text>
        <rect x="150" y="580" width="300" height="45" rx="12" fill="url(#btnGrad)"/>
        <text x="300" y="608" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">OPEN APPLICATION</text>
        
        <rect x="540" y="150" width="400" height="500" rx="20" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="740" y="220" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">🖼️</text>
        <text x="740" y="280" font-family="Arial" font-size="28" font-weight="bold" fill="#667eea" text-anchor="middle">Image Gallery</text>
        <text x="740" y="320" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">Browse images</text>
        <rect x="590" y="580" width="300" height="45" rx="12" fill="url(#btnGrad)"/>
        <text x="740" y="608" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">OPEN APPLICATION</text>
        
        <rect x="980" y="150" width="400" height="500" rx="20" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="1180" y="220" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">📈</text>
        <text x="1180" y="280" font-family="Arial" font-size="28" font-weight="bold" fill="#667eea" text-anchor="middle">Performance</text>
        <text x="1180" y="320" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">KPI dashboard</text>
        <rect x="1030" y="580" width="300" height="45" rx="12" fill="url(#btnGrad)"/>
        <text x="1180" y="608" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">OPEN APPLICATION</text>
        
        <rect x="1420" y="150" width="400" height="500" rx="20" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="1620" y="220" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">⚙️</text>
        <text x="1620" y="280" font-family="Arial" font-size="28" font-weight="bold" fill="#667eea" text-anchor="middle">Admin Panel</text>
        <text x="1620" y="320" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">System management</text>
        <rect x="1470" y="580" width="300" height="45" rx="12" fill="url(#btnGrad)"/>
        <text x="1620" y="608" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">OPEN ADMIN PANEL</text>
    `;
    const dashboardBuffer = await createMockupImage('dashboard.png', 1920, 1080, dashboardContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'dashboard.png'), dashboardBuffer);
    console.log('✅ Created: dashboard.png');
    
    // 3. Daily Plan Viewer Mockup
    const dailyPlanContent = `
        <rect y="0" width="1920" height="90" fill="url(#headerGrad)"/>
        <text x="100" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="#667eea">TripleA</text>
        <text x="300" y="55" font-family="Arial" font-size="24" font-weight="bold" fill="#fff">Daily Plan Viewer</text>
        <text x="1700" y="40" font-family="Arial" font-size="18" font-weight="bold" fill="#667eea">14:30</text>
        <text x="1700" y="65" font-family="Arial" font-size="14" fill="#aaa">Evening Schedule</text>
        
        <rect x="200" y="150" width="1520" height="800" rx="20" fill="#1a1d29" stroke="#667eea" stroke-width="2"/>
        <text x="960" y="600" font-family="Arial" font-size="36" font-weight="bold" fill="#667eea" text-anchor="middle">Evening Schedule</text>
        <text x="960" y="650" font-family="Arial" font-size="24" fill="#aaa" text-anchor="middle">14:30 - 22:29</text>
        
        <rect x="700" y="750" width="520" height="60" rx="12" fill="url(#cardGrad)"/>
        <text x="960" y="790" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle">Current Schedule: Evening | Next: Night (22:30)</text>
    `;
    const dailyPlanBuffer = await createMockupImage('daily-plan-viewer.png', 1920, 1080, dailyPlanContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'daily-plan-viewer.png'), dailyPlanBuffer);
    console.log('✅ Created: daily-plan-viewer.png');
    
    // 4. Image Gallery Mockup
    const galleryContent = `
        <rect y="0" width="1920" height="90" fill="url(#headerGrad)"/>
        <text x="100" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="#667eea">TripleA</text>
        <text x="300" y="55" font-family="Arial" font-size="24" font-weight="bold" fill="#fff">Image Gallery</text>
        
        <rect x="100" y="150" width="400" height="300" rx="12" fill="#2a2a3e" stroke="#667eea" stroke-width="1"/>
        <text x="300" y="300" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">📷</text>
        <text x="300" y="350" font-family="Arial" font-size="18" fill="#aaa" text-anchor="middle">Folder 1</text>
        
        <rect x="540" y="150" width="400" height="300" rx="12" fill="#2a2a3e" stroke="#667eea" stroke-width="1"/>
        <text x="740" y="300" font-family="Arial" font-size="48" fill="#667eea" text-anchor="middle">🖼️</text>
        <text x="740" y="350" font-family="Arial" font-size="18" fill="#aaa" text-anchor="middle">Folder 2</text>
        
        <rect x="980" y="150" width="840" height="700" rx="12" fill="#1a1d29" stroke="#667eea" stroke-width="2"/>
        <text x="1400" y="500" font-family="Arial" font-size="72" fill="#667eea" text-anchor="middle">🖼️</text>
        <text x="1400" y="600" font-family="Arial" font-size="24" fill="#aaa" text-anchor="middle">Selected Image</text>
        
        <rect x="1200" y="750" width="400" height="60" rx="12" fill="url(#btnGrad)"/>
        <text x="1400" y="790" font-family="Arial" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">◀ PREVIOUS | NEXT ▶</text>
    `;
    const galleryBuffer = await createMockupImage('image-gallery.png', 1920, 1080, galleryContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'image-gallery.png'), galleryBuffer);
    console.log('✅ Created: image-gallery.png');
    
    // 5. Performance Dashboard Mockup
    const performanceContent = `
        <rect y="0" width="1920" height="90" fill="url(#headerGrad)"/>
        <text x="100" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="#667eea">TripleA</text>
        <text x="300" y="55" font-family="Arial" font-size="24" font-weight="bold" fill="#fff">Performance Dashboard</text>
        
        <rect x="100" y="150" width="300" height="200" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="250" y="200" font-family="Arial" font-size="14" fill="#667eea">KPI 1</text>
        <text x="250" y="250" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">95%</text>
        
        <rect x="100" y="370" width="300" height="200" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="250" y="420" font-family="Arial" font-size="14" fill="#667eea">KPI 2</text>
        <text x="250" y="470" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">87%</text>
        
        <rect x="450" y="150" width="400" height="200" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="650" y="200" font-family="Arial" font-size="14" fill="#667eea">KPI 3</text>
        <text x="650" y="250" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">1,234</text>
        
        <rect x="900" y="150" width="400" height="200" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="1100" y="200" font-family="Arial" font-size="14" fill="#667eea">KPI 4</text>
        <text x="1100" y="250" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">$5.6M</text>
        
        <rect x="1350" y="150" width="400" height="200" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="1550" y="200" font-family="Arial" font-size="14" fill="#667eea">KPI 5</text>
        <text x="1550" y="250" font-family="Arial" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">42</text>
        
        <rect x="450" y="370" width="1300" height="200" rx="12" fill="#1a1d29" stroke="#667eea" stroke-width="1"/>
        <text x="1100" y="500" font-family="Arial" font-size="18" fill="#667eea" text-anchor="middle">Performance Chart Area</text>
    `;
    const performanceBuffer = await createMockupImage('performance-dashboard.png', 1920, 1080, performanceContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'performance-dashboard.png'), performanceBuffer);
    console.log('✅ Created: performance-dashboard.png');
    
    // 6. Admin Panel Mockup
    const adminContent = `
        <rect y="0" width="1920" height="90" fill="url(#headerGrad)"/>
        <text x="100" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="#667eea">TripleA</text>
        <text x="300" y="55" font-family="Arial" font-size="24" font-weight="bold" fill="#fff">Admin Panel</text>
        
        <rect x="50" y="150" width="250" height="800" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <rect x="70" y="180" width="210" height="40" rx="8" fill="#667eea"/>
        <text x="175" y="205" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">Users</text>
        
        <text x="175" y="260" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">Network Paths</text>
        <text x="175" y="310" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">Layouts</text>
        <text x="175" y="360" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">Analytics</text>
        <text x="175" y="410" font-family="Arial" font-size="14" fill="#aaa" text-anchor="middle">Configuration</text>
        
        <rect x="350" y="150" width="1500" height="800" rx="12" fill="url(#cardGrad)" stroke="#667eea" stroke-width="1"/>
        <text x="1100" y="220" font-family="Arial" font-size="28" font-weight="bold" fill="#fff" text-anchor="middle">User Management</text>
        
        <rect x="400" y="280" width="1400" height="50" rx="8" fill="#1a1d29"/>
        <text x="450" y="310" font-family="Arial" font-size="14" fill="#667eea">ID</text>
        <text x="550" y="310" font-family="Arial" font-size="14" fill="#667eea">Username</text>
        <text x="750" y="310" font-family="Arial" font-size="14" fill="#667eea">Role</text>
        <text x="950" y="310" font-family="Arial" font-size="14" fill="#667eea">Actions</text>
        
        <rect x="400" y="350" width="1400" height="50" rx="8" fill="#2a2a3e"/>
        <text x="450" y="380" font-family="Arial" font-size="14" fill="#fff">1</text>
        <text x="550" y="380" font-family="Arial" font-size="14" fill="#fff">admin</text>
        <text x="750" y="380" font-family="Arial" font-size="14" fill="#667eea">Admin</text>
        
        <rect x="1300" y="850" width="200" height="50" rx="12" fill="url(#btnGrad)"/>
        <text x="1400" y="880" font-family="Arial" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">+ ADD USER</text>
    `;
    const adminBuffer = await createMockupImage('admin-panel.png', 1920, 1080, adminContent);
    fs.writeFileSync(path.join(MOCKUPS_DIR, 'admin-panel.png'), adminBuffer);
    console.log('✅ Created: admin-panel.png');
    
    console.log(`\n✅ Created 6 mockup images in ${MOCKUPS_DIR}`);
}

if (require.main === module) {
    createMockups().catch(error => {
        console.error('Error creating mockups:', error);
        process.exit(1);
    });
}

module.exports = { createMockups };

