const bcrypt = require('bcryptjs');

async function main() {
    const password = 'Heang6232'; // Your chosen password
    const saltRounds = 10;

    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        console.log('Generated Hash:', hash);
        process.exit(0); // Exit the script gracefully after generating hash
    } catch (error) {
        console.error('Error generating hash:', error);
        process.exit(1); // Exit with an error code
    }
}

main();