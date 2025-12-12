const http = require('http');

console.log('Testing server response...\n');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log('\n--- Response Body ---');
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(data.substring(0, 500));
        console.log(`\nTotal length: ${data.length} bytes`);
        
        if (data.length === 0) {
            console.log('\n❌ ERROR: Server returned empty response!');
        } else if (data.includes('<html')) {
            console.log('\n✅ SUCCESS: Server returned HTML content');
        } else {
            console.log('\n⚠️  WARNING: Response does not look like HTML');
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ ERROR:', error.message);
    console.error('Server is not running or not accessible');
});

req.end();

