require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const router = express.Router();

describe("Admin", function () {
  before((done) => {
    mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", function () {
      console.log("We are connected to test database!");
      done();
    });
  });
  describe("POST, api/admin/createuser #save()", function () {
    it("Should save an admin user", async (done) => {
      let newAdmin = new Admin({
        password: "123456",
        email: "alex@mail.com",
        name: "Alex Test",
        password2: "123456",
      });
      await newAdmin.save(done());
    });
  });
  describe("POST, api/admin/createuser", function () {
    it("Should not find a created user", (done) => {
      const { email, name, password } = {
        email: "alex@gmail.com",
        name: "alex",
        password: "123456",
      };

      const foundUser = Admin.find({ email }, (err, email) => {
        if (err) throw err;
        if (email.length <= 0) throw new Error("No email found");
      });

      if (!foundUser) {
        throw new Error("No found user");
      }

      const newAdmin = new Admin({
        email,
        name,
        password,
      });

      newAdmin.save(done());
    });
  });
});
