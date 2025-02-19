const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on CREATE and SAVE!!!! (not on update)
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// password encryption before saving the user details to the database.  // so we use this document middleware funciton
userSchema.pre('save', async function (next) {
  // only run this funciton if password was actually modified
  if (!this.isModified('password')) return next();

  // password hashing algorithm -- BCRYPT -- first salt then hash the password , to protect from the bruteforce attacks
  // salt - its gonna add a random string to the password so that two equal passwords do not generate the same hash.
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete passConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if(!this.isModified('password') ||  this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this keyword points to the current query
  this.find({ active: {$ne: false} });
  next();
});


// instance method is a method that is available on all documents of a certain collection.
// 12345678 === $2a$12$qckokHlJ5TQoKMHr5bu4r.dEDYuTg2ek8Vw16q6D.CfUFhH4I7Z26
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // 100 < 200 -- true(changed) , 300 < 100 -- false(not changed)
  }

  // false meand not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({resetToken}, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
