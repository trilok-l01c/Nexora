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
import {
    createPortfolioProject,
    createPortfolioUpdate,
    deletePortfolioProject,
    deletePortfolioUpdate,
    listAdminPortfolioProjects,
    listPortfolioUpdates,
    updatePortfolioProject,
    updatePortfolioUpdate,
} from "../controllers/adminPortfolioController.js";

const router = Router();

router.post("/login", validateLogin, loginAdmin);
router.post("/logout", logout);
router.use(authenticateAdmin);
router.get("/home", getHomeContent);
router.patch("/home", updateHomeContent);
router.get("/projects", listProjects);
router.post("/projects", createProject);
router.patch("/projects/:id", updateProject);
router.get("/portfolio", listAdminPortfolioProjects);
router.post("/portfolio", createPortfolioProject);
router.patch("/portfolio/:id", updatePortfolioProject);
router.delete("/portfolio/:id", deletePortfolioProject);
router.get("/portfolio/:id/updates", listPortfolioUpdates);
router.post("/portfolio/:id/updates", createPortfolioUpdate);
router.patch("/portfolio/:id/updates/:updateId", updatePortfolioUpdate);
router.delete("/portfolio/:id/updates/:updateId", deletePortfolioUpdate);

export default router;
