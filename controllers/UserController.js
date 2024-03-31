const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const env = require("dotenv");

const registerUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return res.status(409).json({ message: "This email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName,
      password: hashedPassword,
      role: "Admin",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: "Email or Password Incorrect" });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Email or Password Incorrect" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.Secret_KEY, {
      expiresIn: "1d",
    });
    res.cookie("access_token", token);
    res.status(200).json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogout = (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "Logged out successfully" });
};

const editUser = async (req, res) => {
  const currentUser = req.cookies;
  console.log(currentUser);
};

module.exports = { registerUser, userLogin, userLogout, editUser };
