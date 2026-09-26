import express from "express";
import {
  getProfile,
  updateProfile,
} from "../../controllers/profile/Profile.js";

import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.put("/", protect, updateProfile);

export default router;