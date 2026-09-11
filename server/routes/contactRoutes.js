import { Router } from "express";
import {
    createContact,
    downloadContactAttachment,
    listContacts,
} from "../controllers/contactController.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { validateContact } from "../middleware/validateContact.js";
import { uploadContactFiles } from "../middleware/uploadContactFiles.js";

const router = Router();

router.post("/", uploadContactFiles, validateContact, createContact);
router.get("/", authenticateAdmin, listContacts);
router.get(
    "/:id/attachments/:attachmentId",
    authenticateAdmin,
    downloadContactAttachment,
);

export default router;
