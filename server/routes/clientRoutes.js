import { Router } from "express";
import {
    createClientProject,
    createTicket,
    getAccount,
    getDashboard,
    getProject,
    listClientProjects,
    updateAccount,
} from "../controllers/clientController.js";
import { authenticateClient } from "../middleware/authenticateUser.js";

const router = Router();
router.use(authenticateClient);
router.get("/dashboard", getDashboard);
router.get("/account", getAccount);
router.patch("/account", updateAccount);
router.get("/projects", listClientProjects);
router.post("/projects", createClientProject);
router.get("/projects/:projectId", getProject);
router.post("/tickets", createTicket);

export default router;
