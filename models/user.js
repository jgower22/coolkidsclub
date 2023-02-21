const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'first name cannot be empty']},
    lastName: {type: String, required: [true, 'last name cannot be empty']},
    email: {type: String, required: [true, 'email cannot be empty'], unique: true},
    username: {type: String, unique: true},
    password: {type: String},
    firstLogin: {type: Boolean}
},
{timestamps: true});

userSchema.pre('save', function(next) {
    let user = this;

    console.log('TESt')
    if (!user.isModified('password'))
        return next();
    console.log('TEST2')

    //Hash password
    bcrypt.hash(user.password, 10)
    .then(hash => {
        user.password = hash;
        console.log(hash);
        next();
    })
    .catch(err => next(err));
});

userSchema.methods.comparePassword = function(loginPassword) {
    return bcrypt.compare(loginPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
