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
    addLeadNote,
    convertLead,
    getLead,
    listLeads,
    updateLead,
    updateLeadNote,
    updateLeadStatus,
} from "../controllers/leadController.js";
import { validateLeadConversion } from "../middleware/validateLeadConversion.js";
import { validateLeadNote } from "../middleware/validateLeadNote.js";
import { validateLeadStatus } from "../middleware/validateLeadStatus.js";
import { validateLeadUpdate } from "../middleware/validateLeadUpdate.js";
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
router.get("/leads", listLeads);
router.get("/leads/:id", getLead);
router.patch("/leads/:id", validateLeadUpdate, updateLead);
router.patch("/leads/:id/status", validateLeadStatus, updateLeadStatus);
router.post("/leads/:id/notes", validateLeadNote, addLeadNote);
router.patch("/leads/:id/notes/:noteId", validateLeadNote, updateLeadNote);
router.post("/leads/:id/convert", validateLeadConversion, convertLead);
router.get("/portfolio", listAdminPortfolioProjects);
router.post("/portfolio", createPortfolioProject);
router.patch("/portfolio/:id", updatePortfolioProject);
router.delete("/portfolio/:id", deletePortfolioProject);
router.get("/portfolio/:id/updates", listPortfolioUpdates);
router.post("/portfolio/:id/updates", createPortfolioUpdate);
router.patch("/portfolio/:id/updates/:updateId", updatePortfolioUpdate);
router.delete("/portfolio/:id/updates/:updateId", deletePortfolioUpdate);

export default router;
