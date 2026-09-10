import { Router } from "express";
import {
    createContact,
    listContacts,
} from "../controllers/contactController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { validateContact } from "../middleware/validateContact.js";

const router = Router();

router.post("/", validateContact, createContact);
router.get("/", authenticateAdmin, listContacts);

export default router;
