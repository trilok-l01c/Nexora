import { Router } from "express";
import {
    getContact,
    listContacts,
    updateContactStatus,
} from "../controllers/contactController.js";
import { login, logout } from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { validateLeadStatus } from "../middleware/validateLeadStatus.js";
import { validateLogin } from "../middleware/validateLogin.js";

const router = Router();

router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.use(authenticateAdmin);
router.get("/leads", listContacts);
router.get("/leads/:id", getContact);
router.patch("/leads/:id/status", validateLeadStatus, updateContactStatus);

export default router;
