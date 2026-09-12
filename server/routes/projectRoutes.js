import { Router } from "express";
import {
    createClientProject,
    getProject,
    listClientProjects,
} from "../controllers/clientController.js";
import { authenticateClient } from "../middleware/authenticateUser.js";

const router = Router();
router.use(authenticateClient);
router.get("/", listClientProjects);
router.post("/", createClientProject);
router.get("/:projectId", getProject);

export default router;
