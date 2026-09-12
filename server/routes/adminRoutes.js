import { Router } from "express";
import {
    getContact,
    downloadContactAttachment,
    listContacts,
    updateContactStatus,
} from "../controllers/contactController.js";
import { loginAdmin, logout } from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { validateLeadStatus } from "../middleware/validateLeadStatus.js";
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
router.get("/leads", listContacts);
router.get("/leads/:id", getContact);
router.get("/leads/:id/attachments/:attachmentId", downloadContactAttachment);
router.patch("/leads/:id/status", validateLeadStatus, updateContactStatus);

export default router;
