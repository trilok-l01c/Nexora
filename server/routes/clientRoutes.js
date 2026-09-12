import { Router } from "express";
import {
    createTicket,
    getDashboard,
    getProject,
} from "../controllers/clientController.js";
import { authenticateClient } from "../middleware/authenticateUser.js";

const router = Router();
router.use(authenticateClient);
router.get("/dashboard", getDashboard);
router.get("/projects/:projectId", getProject);
router.post("/tickets", createTicket);

export default router;
