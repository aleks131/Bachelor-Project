console.log('=== TESTING SERVER STARTUP ===\n');

try {
    console.log('[1] Testing require statements...');
    const express = require('express');
    console.log('  ✅ express');
    
    const http = require('http');
    console.log('  ✅ http');
    
    const path = require('path');
    console.log('  ✅ path');
    
    const fs = require('fs');
    console.log('  ✅ fs');
    
    const session = require('express-session');
    console.log('  ✅ express-session');
    
    const cors = require('cors');
    console.log('  ✅ cors');
    
    const compression = require('compression');
    console.log('  ✅ compression');
    
    const WebSocket = require('ws');
    console.log('  ✅ ws');
    
    console.log('\n[2] Testing config file...');
    const configPath = path.join(__dirname, 'data/config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error('Config file not found: ' + configPath);
    }
    const config = require(configPath);
    console.log('  ✅ config.json loaded');
    console.log('  Port:', config.server.port);
    
    console.log('\n[3] Testing auth module...');
    const auth = require('./backend/auth');
    console.log('  ✅ auth module');
    
    console.log('\n[4] Testing logger module...');
    const logger = require('./backend/utils/logger');
    console.log('  ✅ logger module');
    
    console.log('\n[5] Testing monitoring module...');
    const monitoring = require('./backend/utils/monitoring');
    console.log('  ✅ monitoring module');
    
    console.log('\n[6] Testing route modules...');
    const dailyPlanRoutes = require('./backend/routes/daily-plan');
    console.log('  ✅ daily-plan routes');
    
    const galleryRoutes = require('./backend/routes/gallery');
    console.log('  ✅ gallery routes');
    
    const dashboardRoutes = require('./backend/routes/dashboard');
    console.log('  ✅ dashboard routes');
    
    console.log('\n[7] Creating Express app...');
    const app = express();
    console.log('  ✅ Express app created');
    
    console.log('\n[8] Creating HTTP server...');
    const server = http.createServer(app);
    console.log('  ✅ HTTP server created');
    
    console.log('\n[9] Testing server listen...');
    const PORT = config.server.port || 3000;
    
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n✅✅✅ SUCCESS! Server listening on port ${PORT} ✅✅✅\n`);
        console.log('Server is working! You can now test: http://localhost:' + PORT);
        console.log('\nPress Ctrl+C to stop...\n');
    });
    
    server.on('error', (err) => {
        console.error('\n❌ SERVER ERROR:', err);
        if (err.code === 'EADDRINUSE') {
            console.error('Port', PORT, 'is already in use!');
        }
        process.exit(1);
    });
    
} catch (error) {
    console.error('\n❌❌❌ ERROR DURING STARTUP ❌❌❌\n');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}

