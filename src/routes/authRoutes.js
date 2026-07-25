import express from "express";
import {
    register,
    login,
    logout,
    getCurrentUser  
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // Employee registers using invitation token
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);

export default router;