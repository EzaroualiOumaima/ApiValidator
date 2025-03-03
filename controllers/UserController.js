const bcrypt = require("bcrypt");
const {User, userValidation} = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const env = require("dotenv");

const registerUser = async (req, res) => {
  try {
    const {error} = userValidation.validate(req.body);
    if(error){
      return res.status(400).json({ message: error.details[0].message })
    }
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const {error} = userValidation.validate(req.body);
    if(error){
      return res.status(400).json({ message: error.details[0].message })
    }
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
  const { access_token } = req.cookies;
  const { _id } = jwt.decode(access_token);
  const { userName } = req.body;
  const user = await User.findOneAndUpdate(
    { _id },
    { userName },
    { new: true }
  );
  res.json({ user, message: "user updated" });
};
const deleteUser = async (req, res) => {
  const { access_token } = req.cookies;
  const { _id } = jwt.decode(access_token);
  const user = await User.findOneAndDelete({ _id });
  res.json({ message: "user deleted" });
};
module.exports = { registerUser, userLogin, userLogout, editUser, deleteUser };
