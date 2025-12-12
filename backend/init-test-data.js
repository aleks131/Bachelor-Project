const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const auth = require('./auth');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const TEST_IMAGES_DIR = path.join(__dirname, '../data/test-images');

async function createTestUsers() {
    console.log('Creating test users...');
    
    const usersData = auth.loadUsers();
    
    const testUsers = [
        {
            username: 'manager1',
            password: 'manager123',
            role: 'manager',
            allowedApps: ['gallery', 'dashboard'],
            networkPaths: {
                main: path.join(__dirname, '../data/test-images'),
                gallery: path.join(__dirname, '../data/test-images/gallery'),
                kpi: path.join(__dirname, '../data/test-images/kpi')
            }
        },
        {
            username: 'operator1',
            password: 'operator123',
            role: 'operator',
            allowedApps: ['daily-plan'],
            networkPaths: {
                main: path.join(__dirname, '../data/test-images'),
                dailyPlan: path.join(__dirname, '../data/test-images/daily-plan')
            }
        },
        {
            username: 'demo',
            password: 'demo123',
            role: 'operator',
            allowedApps: ['daily-plan', 'gallery', 'dashboard'],
            networkPaths: {
                main: path.join(__dirname, '../data/test-images'),
                dailyPlan: path.join(__dirname, '../data/test-images/daily-plan'),
                gallery: path.join(__dirname, '../data/test-images/gallery'),
                kpi: path.join(__dirname, '../data/test-images/kpi')
            }
        }
    ];
    
    for (const userData of testUsers) {
        const existingUser = usersData.users.find(u => u.username === userData.username);
        
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = {
                id: usersData.users.length > 0 ? Math.max(...usersData.users.map(u => u.id)) + 1 : 2,
                username: userData.username,
                password: hashedPassword,
                role: userData.role,
                allowedApps: userData.allowedApps,
                networkPaths: userData.networkPaths,
                lastUsedApp: null,
                preferences: {}
            };
            
            usersData.users.push(newUser);
            console.log(`✅ Created user: ${userData.username} (${userData.role})`);
        } else {
            console.log(`⏭️  User already exists: ${userData.username}`);
        }
    }
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf8');
    console.log('✅ Test users created successfully!');
}

function createTestImageDirectories() {
    console.log('\nCreating test image directories...');
    
    const directories = [
        'test-images',
        'test-images/daily-plan',
        'test-images/daily-plan/Morning',
        'test-images/daily-plan/Evening',
        'test-images/daily-plan/Night',
        'test-images/gallery',
        'test-images/gallery/folder1',
        'test-images/gallery/folder2',
        'test-images/kpi',
        'test-images/kpi/kpi1',
        'test-images/kpi/kpi2'
    ];
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, '../data', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
    
    console.log('✅ Test directories created!');
}

function createPlaceholderFiles() {
    console.log('\nCreating placeholder files...');
    
    const placeholderText = `This is a placeholder file for testing.
    
To test the application properly:
1. Add real image files (.jpg, .png, etc.) to these directories
2. For Daily Plan Viewer: Add images to Morning/, Evening/, Night/ folders
3. For Gallery: Add images to gallery/ folders
4. For Dashboard: Add images to kpi/ folders

Supported formats: .jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .svg, .mp4, .webm, .mov, .avi, .mkv`;
    
    const placeholderFiles = [
        'test-images/README.txt',
        'test-images/daily-plan/README.txt',
        'test-images/gallery/README.txt',
        'test-images/kpi/README.txt'
    ];
    
    placeholderFiles.forEach(file => {
        const filePath = path.join(__dirname, '../data', file);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, placeholderText, 'utf8');
        console.log(`✅ Created: ${file}`);
    });
    
    console.log('✅ Placeholder files created!');
}

async function main() {
    try {
        console.log('🚀 Initializing test data...\n');
        
        await createTestUsers();
        createTestImageDirectories();
        createPlaceholderFiles();
        
        console.log('\n✅ Test data initialization complete!');
        console.log('\n📝 Test Users Created:');
        console.log('  - manager1 / manager123 (Manager)');
        console.log('  - operator1 / operator123 (Operator)');
        console.log('  - demo / demo123 (Operator)');
        console.log('\n📁 Test directories created in: data/test-images/');
        console.log('\n💡 Add your test images to the directories to test the applications!');
        
    } catch (error) {
        console.error('❌ Error initializing test data:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createTestUsers, createTestImageDirectories, createPlaceholderFiles };

