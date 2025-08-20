import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signup = async function (request, response) {
  const { fullName, email, password } = request.body;

  try {
    if (!fullName || !email || !password) {
      return response.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return response
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({ message: "Invalid email format" });
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return response
        .status(400)
        .json({ message: "Email is already exist. please use another email" });
    }

    const randomIndex = Math.floor(Math.random() * 1000) + 1;
    const randomAvatar = `https://i.pravatar.cc/${randomIndex}`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePicture: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      console.log(`Stream User created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating stream user", error);
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    response.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    response.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log(`Error in signup controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const login = async function (request, response) {
  const { email, password } = request.body;

  try {
    if (!email || !password) {
      response.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    const isPasswordCorrect = await user?.comparePasswords(password);
    if (!user || !isPasswordCorrect) {
      response.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    response.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    response.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log(`Error in login controller ${error}`);
    response.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async function (request, response) {
  response.clearCookie("jwt");
  response.status(200).json({ succes: true, message: "Logout successful" });
};

const onboard = async function (request, response) {
  try {
    const userId = request.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      request.body;

    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return response.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "native language",
          !learningLanguage && "learning language",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...request.body, isOnboarded: true },
      { new: true }
    );

    if (!updatedUser) {
      return response.status(404).json({ message: "No User found" });
    }

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      console.log(`Stream User updated for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error updating stream user", error);
    }

    response.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error in onboard controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

export { signup, login, logout, onboard };
