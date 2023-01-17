const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config({path: __dirname + '/process.env'});
const xss = require('xss-clean');



const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    set: xss()
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


const UserModel = mongoose.model("UserModel", UserSchema);

module.exports = UserModel;


