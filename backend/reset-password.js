const auth = require('./auth');

const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
    console.log('Usage: node backend/reset-password.js <username> <new-password>');
    process.exit(1);
}

async function resetPassword() {
    try {
        const usersData = auth.loadUsers();
        const user = usersData.users.find(u => u.username === username);
        
        if (!user) {
            console.error(`User "${username}" not found.`);
            process.exit(1);
        }
        
        const result = await auth.updateUser(user.id, { password: newPassword });
        
        if (result.success) {
            console.log(`✓ Password reset successfully for user "${username}"`);
        } else {
            console.error('✗ Failed to reset password:', result.message);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
}

resetPassword();
