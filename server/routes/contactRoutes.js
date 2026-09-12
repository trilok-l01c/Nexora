import { Router } from "express";
import { createEnquiry } from "../controllers/enquiryController.js";
import { validateEnquiry } from "../middleware/validateEnquiry.js";

const router = Router();

router.post("/", validateEnquiry, createEnquiry);

export default router;
