import express from "express";
import {
  login,
  logout,
  signup,
  onboard,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);
router.get("/me", protectRoute, function (request, response) {
  response.status(200).json({ success: true, user: request.user });
});

export default router;
