import express from "express";
import { sendInvitation } from "../controllers/invitationController.js";
import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/send", protect, isAdmin, sendInvitation);

export default router;