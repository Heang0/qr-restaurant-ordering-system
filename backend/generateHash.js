// generateHash.js
const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`Your NEW Plain-Text Password (REMEMBER THIS!): ${password}`);
    console.log(`Your NEW Hashed Password (PUT THIS IN DB): ${hashedPassword}`);
}

// --- IMPORTANT: CHOOSE A NEW PASSWORD YOU WILL REMEMBER HERE! ---
generatePasswordHash('heang6232#$%@!'); // <--- CHANGE THIS TO SOMETHING YOU'LL REMEMBER!