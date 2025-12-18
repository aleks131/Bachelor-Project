const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname);
const contentDir = path.join(projectRoot, 'data/content/demo-images');

console.log('--- DIAGNOSTIC START ---');
console.log('Project Root:', projectRoot);
console.log('Content Dir:', contentDir);
console.log('Content Dir Exists:', fs.existsSync(contentDir));

if (fs.existsSync(contentDir)) {
    const subs = ['daily-plan', 'gallery', 'kpi'];
    subs.forEach(sub => {
        const subPath = path.join(contentDir, sub);
        console.log(`Checking ${sub}: ${subPath}`);
        if (fs.existsSync(subPath)) {
            console.log(`  [OK] Exists`);
            try {
                const files = fs.readdirSync(subPath);
                console.log(`  Files: ${files.length}`);
                files.slice(0, 3).forEach(f => console.log(`    - ${f}`));
            } catch (e) {
                console.log(`  [ERR] Read failed: ${e.message}`);
            }
        } else {
            console.log(`  [FAIL] Does NOT exist`);
        }
    });
}

console.log('--- PATH RESOLUTION TEST ---');
function resolvePath(inputPath) {
    if (path.isAbsolute(inputPath)) return path.normalize(inputPath);
    return path.resolve(path.join(__dirname, inputPath));
}

const testPath = 'data/content/demo-images/daily-plan';
const resolved = resolvePath(testPath);
console.log(`Input: ${testPath}`);
console.log(`Resolved: ${resolved}`);
console.log(`Exists: ${fs.existsSync(resolved)}`);
console.log('--- DIAGNOSTIC END ---');

