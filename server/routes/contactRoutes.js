import { Router } from "express";
import { createLead } from "../controllers/leadController.js";
import { validateLead } from "../middleware/validateLead.js";

const router = Router();

// The public enquiry form creates a lead for the Nexora team to follow up on.
// It never creates a client account, company, or project.
router.post("/", validateLead, createLead);

export default router;
