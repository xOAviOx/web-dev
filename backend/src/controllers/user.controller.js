import { User } from "../models/user.model.js";

const isMissing = (value) => typeof value !== "string" || value.trim() === "";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (isMissing(username) || isMissing(email) || isMissing(password)) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.trim().toLowerCase() }, { username: username.trim().toLowerCase() }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email or username already exists" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      message: "User registered",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "A user with this email or username already exists" });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (isMissing(email) || isMissing(password)) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "User logged in",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (isMissing(email)) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, loginUser, logoutUser };
