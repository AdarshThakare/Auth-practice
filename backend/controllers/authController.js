import { User } from "../models/user.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateNewToken } from "../utils/jwtToken.js";
import {
  sendPasswordResetSuccessEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";

export async function registerUser(req, res) {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("Enter all the details!");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: "User already exists!", success: false });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 6,
    });

    await newUser.save();

    //generating jwt and storing it in cookies

    generateNewToken(res, newUser._id);

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User Created Successfully! :)",
      user: { ...newUser._doc, password: undefined },
    });
  } catch (err) {
    console.log("Error while registering the user : ", err.message);
  }
}

export async function verifyToken(req, res) {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message:
          "The code you have entered is INVALID or has been EXPIRED. Try Again. ",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification Code is idenrified as CORRECT",
      user: { ...user._doc, password: undefined },
    });

    await sendWelcomeEmail(user.email, user.name);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error at Code Verification",
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error("Enter all the details!");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found! Please register first.",
      });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials! Please try again.",
      });
    }

    generateNewToken(res, user._id);
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      data: { ...user._doc, password: undefined },
    });
  } catch (err) {
    console.log("Error while logging in the user : ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error at User Login",
    });
  }
}

export async function logoutUser(req, res) {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully!" });
  } catch (err) {
    console.log("Error while logging out the user : ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error at User Logout",
    });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      throw new Error("Enter all the details! (Email is required)");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    // Store the reset token and its expiration time in the user document

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    console.log("\nReset Token: ", resetToken);

    console.log("\nFRONTEND URL: ", process.env.FRONTEND_URL);
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetURL);

    res.status(200).json({
      success: true,
      message: "Reset password email sent!",
    });
  } catch (err) {
    console.log("Error while sending reset password email : ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error at Forgot Password",
    });
  }
}

export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!token || !password) {
      throw new Error(
        "Enter all the details! (Token and Password are required)"
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token!",
      });
    }

    if (password === user.password) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password!",
      });
    }

    user.password = await bcryptjs.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    await user.save();

    await sendPasswordResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Your Password has been reset successfully! :) !",
    });
  } catch (err) {
    console.log("Error while resetting password : ", err.message);
    return res.status(400).json({
      success: false,
      message: "Invalid request data!",
    });
  }
}

export async function checkAuth(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
