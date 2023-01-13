const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config({path: __dirname + '/process.env'});
const db_key = process.env.DATABASE_KEY;

const UserSchema = new mongoose.Schema({
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

mongoose.connect( "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = User;

// userSchema.methods.validatePassword = function(password) {
//   return password === this.password;
// };

