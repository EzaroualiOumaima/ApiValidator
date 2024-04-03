const mongoose = require('mongoose');
const Joi = require("joi")

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
 
});

const userValidation = Joi.object({
  userName: Joi.string().required(),
  password: Joi.string().required()
})


const User = mongoose.model('User', userSchema);

module.exports = {User, userValidation};