const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'first name cannot be empty']},
    lastName: {type: String, required: [true, 'last name cannot be empty']},
    email: {type: String, required: [true, 'email cannot be empty'], unique: true},
    username: {type: String, unique: true, 
        minLength: [7, 'the username should have at least 7 characters'],
        maxLength: [64, 'the username should have a maximum of 64 characters']},
    password: {type: String,
        minLength: [8, 'the password should have at least 8 characters'],
        maxLength: [64, 'the password should have a maximum of 64 characters']},
    firstLogin: {type: Boolean},
    status: {type: String, enum: ['pending', 'active', 'banned']},
    role: {type: String}
},
{timestamps: true});

userSchema.pre('save', function(next) {
    let user = this;

    if (!user.isModified('password'))
        return next();

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
