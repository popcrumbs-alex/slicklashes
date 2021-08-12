const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  adminCode: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
});

module.exports = Admin = mongoose.model("Admin", AdminSchema);
