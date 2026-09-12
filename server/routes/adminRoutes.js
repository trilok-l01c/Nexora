import { Router } from "express";
import { loginAdmin, logout } from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { validateLogin } from "../middleware/validateLogin.js";
import {
    getHomeContent,
    updateHomeContent,
} from "../controllers/homeController.js";
import {
    createProject,
    listProjects,
    updateProject,
} from "../controllers/projectController.js";

const router = Router();

router.post("/login", validateLogin, loginAdmin);
router.post("/logout", logout);
router.use(authenticateAdmin);
router.get("/home", getHomeContent);
router.patch("/home", updateHomeContent);
router.get("/projects", listProjects);
router.post("/projects", createProject);
router.patch("/projects/:id", updateProject);

export default router;
