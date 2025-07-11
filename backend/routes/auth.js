import express from "express";
import {
  checkAuth,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  verifyToken,
} from "../controllers/authController.js";
import { verifyAuth } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/verify-token", verifyToken);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/check-auth", verifyAuth, checkAuth);

export default router;
