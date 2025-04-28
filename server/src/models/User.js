const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    console.log('Pre-save hook triggered');
    console.log('Is password modified:', this.isModified('password'));

    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) {
        console.log('Password not modified, skipping hashing');
        return next();
    }

    try {
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');

        // Store the original password for debugging
        const originalPassword = this.password;

        // Set the hashed password
        this.password = hashedPassword;

        console.log('Password before:', originalPassword.substring(0, 3) + '***');
        console.log('Password after:', hashedPassword.substring(0, 10) + '...');

        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        // Make sure password is populated
        if (!this.password) {
            console.error('No password field available for comparison');
            return false;
        }

        console.log('Comparing passwords:');
        console.log('Entered password length:', enteredPassword.length);
        console.log('Stored password (partial):', this.password.substring(0, 10) + '...');

        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Register hooks - this makes sure the pre middleware is applied
UserSchema.pre('init', function() {
    console.log('User model initialized');
});

// Add a validation method to force update the password 
UserSchema.methods.updateAndHashPassword = async function(newPassword) {
    this.password = newPassword;
    this.markModified('password'); // Force Mongoose to recognize the password changed
    return await this.save();
};

module.exports = mongoose.model('User', UserSchema);