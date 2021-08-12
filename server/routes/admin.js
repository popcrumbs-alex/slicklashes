const express = require("express");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const router = express.Router();

//@route POST route
//@desc create user
//@access public
router.post(
  "/createuser",
  [
    check("userName", "Please add a user name").not().isEmpty(),
    check("name", "Please enter your name").not().isEmpty(),
    check("password", "Please create a password").not().isEmpty(),
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Please create a password that is atleast 6 characters long"
    ).isLength({ min: 6 }),
    check("password2", "Please confirm your password").not().isEmpty(),
    check("adminCode", "Please enter the admin code").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, password2, adminCode, name, userName, email } = req.body;

    if (adminCode !== process.env.ADMIN_CODE) {
      return res
        .status(400)
        .json({ msg: "Authorization denied, admin code does not match" });
    }

    const foundAdmin = await Admin.findOne({ email });

    if (foundAdmin) {
      return res
        .status(400)
        .json({ msg: "A user with that user name already exists" });
    }

    if (password !== password2) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const newAdmin = new Admin({
      userName,
      name,
      role: "admin",
      email,
    });

    try {
      const salty = await bcrypt.genSalt(10);

      const hash = await bcrypt.hash(password, salty);

      newAdmin.password = hash;

      await newAdmin.save();

      const payload = {
        user: {
          id: newAdmin.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json(token);
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route GET route
//@desc get current admin
//@access private
router.get("/admin", auth, async (req, res) => {
  const foundAdmin = await Admin.findById(req.user.id);

  if (!foundAdmin) {
    return res.status(400).json({ msg: "Could not locate a current user" });
  }

  if (foundAdmin.role !== "admin") {
    return res
      .status(400)
      .json({ msg: "You are not authorized to do this :(" });
  }

  try {
    res.json(foundAdmin);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get a single user
//@access private
router.get("/user/:id", auth, async (req, res) => {
  const foundAdmin = await Admin.findById(req.user.id);
  const foundUser = await Admin.findOne({ _id: req.params.id }).select(
    "-password"
  );

  if (!foundAdmin) {
    return res.status(400).json({ msg: "Could not locate admin" });
  }

  if (foundAdmin.role !== "admin") {
    return res
      .status(400)
      .json({ msg: "You are not authorized for this action" });
  }

  if (!foundUser) {
    return res.status(400).json({ msg: "Could not locate this user" });
  }

  try {
    res.json(foundUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc sign in user
//@access private
router.post(
  "/authenticate",
  [
    check("userName", "Please enter your user name").not().isEmpty(),
    check("password", "Please enter your password").not().isEmpty(),
    check("adminCode", "Please enter the admin code").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    const { userName, password, adminCode } = req.body;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const foundUser = await Admin.findOne({ userName });

    if (adminCode !== process.env.ADMIN_CODE) {
      console.log("Incorrect admin code");
      return res
        .status(400)
        .json({ msg: "Authorization Denied, Admin Code is Incorrect" });
    }
    if (!foundUser) {
      return res
        .status(400)
        .json({ msg: "Could not find a user with that email" });
    }

    try {
      const match = await bcrypt.compare(password, foundUser.password);

      if (!match) {
        return res
          .status(400)
          .json({ msg: "Password did not match for this account" });
      }
      const payload = {
        user: {
          id: foundUser.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          return res.json(token);
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route PUT route
//@desc edit account
//@access private
router.put(
  "/editaccountname",
  auth,
  [
    check("name", "Please enter your name").not().isEmpty(),
    check("newName", "New name cannot be blank").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newName } = req.body;

    //locate admin user once cases pass
    const foundAdmin = await Admin.findById(req.user.id);

    if (newName) foundAdmin.name = newName;

    try {
      await foundAdmin.save();

      res.json(foundAdmin);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route PUT route
//@desc change user roles
//@access privayte
router.put(
  "/changerole",
  auth,
  [
    check("adminCode", "Please enter the admin code if you have it")
      .not()
      .isEmpty(),
    check("email", "Please enter your email").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { adminCode, email } = req.body;

    if (adminCode !== process.env.ADMIN_CODE) {
      return res
        .status(400)
        .json({ msg: "Authorization denied, admin code does not match" });
    }

    const foundAdmin = await Admin.findById(req.user.id);

    if (!foundAdmin) {
      return res.status(400).json({ msg: "Could not locate account" });
    }
    if (email !== foundAdmin.email) {
      return res
        .status(400)
        .json({ msg: "Please enter the correct email for this account" });
    }

    if (foundAdmin.role === "admin") {
      return res.status(400).json({ msg: "You are already an admin" });
    }

    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(400).json({ msg: "Admin Code is Incorrect" });
    }

    if (adminCode === process.env.ADMIN_CODE) {
      foundAdmin.role = "admin";
    }

    try {
      await foundAdmin.save();

      res.json(foundAdmin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);
//@route PUT route
//@desc change email with validation
//@access private
router.put(
  "/changeemail",
  auth,
  [
    check("email", "please enter your email").not().isEmpty(),
    check("newEmail", "Please enter your new email").not().isEmpty(),
    check("newEmail", "Please enter a valid new email").isEmail(),
  ],
  async (req, res) => {
    const { email, newEmail } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: array() });
    }

    const foundEmail = await Admin.findOne({ email: newEmail });

    if (foundEmail) {
      return res
        .status(400)
        .json({ msg: "An account with that email already exists" });
    }

    const foundAdmin = await Admin.findById(req.user.id);

    if (!foundAdmin) {
      return res
        .status(400)
        .json({ msg: "Could not locate an account with that email" });
    }
    if (email === newEmail) {
      return res
        .status(400)
        .json({ msg: "New email cannot be your current email" });
    }
    if (foundAdmin.email !== email) {
      return res
        .status(400)
        .json({ msg: "That is not the email for this account" });
    }
    if (newEmail === foundAdmin.email) {
      return res.status(400).json({
        msg: "New email cannot be old email",
      });
    }

    if (newEmail) foundAdmin.email = newEmail;
    try {
      await foundAdmin.save();

      res.json(foundAdmin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route PUT route
//@desc change password
//@access private
router.put("/changepassword", auth, [
  check("password", "Please enter your password").not().isEmpty(),
  check("newPassword", "Please enter a new password").not().isEmpty(),
  check(
    "newPassword",
    "Please make sure your new password is atleast 6 characters long"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const foundAdmin = await Admin.findById(req.user.id);

    const { password, newPassword } = req.body;

    if (password === newPassword) {
      return res
        .status(400)
        .json({ msg: "New password cannot be current password" });
    }

    const match = await bcrypt.compare(password, foundAdmin.password);

    if (!match) {
      return res.status(400).json({
        msg: "Current password does not match password for this account",
      });
    }
    const salty = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(newPassword, salty);
    foundAdmin.password = hashPass;

    try {
      await foundAdmin.save();

      res.json(foundAdmin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },
]);

//@route DELETE route
//@desc remove an account
//@access private
router.delete(
  "/deleteaccount",
  auth,
  [
    check("email", "Please confirm your email").not().isEmpty(),
    check("password", "Please confirm your password").not().isEmpty(),
    check("password2", "Please confirm you want to delete your account")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, password2 } = req.body;

    const foundAdmin = await Admin.findById(req.user.id);

    if (!foundAdmin) {
      return res.status(400).json({ msg: "Could not locate account" });
    }

    if (email !== foundAdmin.email) {
      return res.status(403).json({
        msg: "That is not the correct email address for this account",
      });
    }

    if (password !== password2) {
      return res.status(400).json({ msg: "passwords do not match" });
    }
    const match = bcrypt.compare(password, foundAdmin.password);

    if (!match) {
      return res.status(403).json({ msg: "That is not the correct password" });
    }

    try {
      await foundAdmin.remove();
      res.json({ msg: "Account deleted :(" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

module.exports = router;
