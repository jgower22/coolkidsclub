const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new Schema({
    firstName: { type: String, required: [true, 'first name cannot be empty'] },
    lastName: { type: String, required: [true, 'last name cannot be empty'] },
    email: { type: String, required: [true, 'email cannot be empty'], unique: true },
    username: {
        type: String, required: true, unique: true,
        minLength: [7, 'the username should have at least 7 characters'],
        maxLength: [64, 'the username should have a maximum of 64 characters']
    },
    password: {
        type: String,
        minLength: [8, 'the password should have at least 8 characters'],
        maxLength: [64, 'the password should have a maximum of 64 characters'], required: true
    },
    firstLogin: { type: Boolean },
    status: { type: String, enum: ['pending', 'active', 'banned'], required: true },
    role: { type: String, required: true }
},
    { timestamps: true });

userSchema.pre('save', function (next) {
    let user = this;

    //Normalize first and last name
    console.log('USER: ' + user);
    if (user.firstName) {
        let firstName = user.firstName.toLowerCase();
        user.firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }

    if (user.lastName) {
        let lastName = user.lastName.toLowerCase();
        user.lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    }

    if (!user.isModified('password'))
        return next();

    //Hash password
    bcrypt.hash(user.password, Number(bcryptSalt))
        .then(hash => {
            user.password = hash;
            console.log(hash);
            next();
        })
        .catch(err => next(err));
});

userSchema.methods.comparePassword = function (loginPassword) {
    return bcrypt.compare(loginPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
