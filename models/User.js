const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: Object },
  additional_info: { type: Object }
});

module.exports = mongoose.model('User', userSchema);


