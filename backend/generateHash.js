// generateHash.js (Now also handles updating Superadmin credentials)
require('dotenv').config(); // Load environment variables from .env if applicable
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Path relative to your backend root
const config = require('./config'); // Path relative to your backend root

async function updateSuperadminCredentials(newEmail, newPassword) {
    try {
        // Connect to MongoDB using the MONGO_URI from config
        // If running locally, ensure your .env has MONGO_URI for your deployed DB
        // If running on Render shell, config.mongoURI will pick up Render's env var.
        await mongoose.connect(config.mongoURI);
        console.log('MongoDB connected successfully.');

        // Find the Superadmin user
        // We will find the Superadmin by their role, and then update their email and password.
        // If you have multiple superadmins, this will update the first one found.
        const superadmin = await User.findOne({ role: 'superadmin' });

        if (!superadmin) {
            console.error('Superadmin user not found in the database. Please ensure one exists.');
            return;
        }

        let updatedFields = [];

        // Update Email if provided and different from current placeholder
        // AND if it's actually a change from the current superadmin email
        if (newEmail && newEmail !== 'UNCHANGED_EMAIL_PLACEHOLDER' && newEmail !== superadmin.email) {
            // Optional: Check if new email already exists for another user
            const existingUserWithNewEmail = await User.findOne({ email: newEmail });
            if (existingUserWithNewEmail && existingUserWithNewEmail._id.toString() !== superadmin._id.toString()) {
                console.error(`Error: Email '${newEmail}' already exists for another user.`);
                return;
            }
            superadmin.email = newEmail;
            updatedFields.push(`email to ${newEmail}`);
        }

        // Hash and Update Password if provided and different from current placeholder
        if (newPassword && newPassword !== 'UNCHANGED_PASSWORD_PLACEHOLDER') {
            if (newPassword.length < 6) {
                console.error('Error: New password must be at least 6 characters long.');
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt); // Generate hash
            superadmin.password = hashedPassword; // Assign hash to user
            updatedFields.push('password');
            console.log(`Generated Hashed Password: ${hashedPassword}`); // Log the generated hash
        }

        if (updatedFields.length === 0) {
            console.log('No changes specified for Superadmin. Script finished without updates.');
            return;
        }

        await superadmin.save();
        console.log(`Successfully updated Superadmin (${superadmin.email}): ${updatedFields.join(' and ')}.`);

    } catch (error) {
        console.error('Error updating Superadmin credentials:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

// --- CONFIGURE YOUR DESIRED NEW EMAIL AND/OR PASSWORD HERE ---
// If you don't want to change a specific field, leave its placeholder value.
const desiredNewEmail = 'hakchhaiheang0@gmail.com'; // <--- SETTING TO THIS EMAIL
const desiredNewPassword = 'heang6232#$Q45'; // <--- SETTING TO THIS PASSWORD

// --- EXECUTE THE UPDATE ---
// This warning helps prevent accidental execution with default placeholders.
if (desiredNewEmail === 'UNCHANGED_EMAIL_PLACEHOLDER' && desiredNewPassword === 'UNCHANGED_PASSWORD_PLACEHOLDER') {
    console.warn("WARNING: Please change 'desiredNewEmail' and/or 'desiredNewPassword' to your actual desired values in the script before running.");
} else {
    updateSuperadminCredentials(desiredNewEmail, desiredNewPassword);
}
