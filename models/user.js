const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config({path: __dirname + '/process.env'});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9\s]+$/

  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", UserSchema);

module.exports = User;

// userSchema.methods.validatePassword = function(password) {
//   return password === this.password;
// };

