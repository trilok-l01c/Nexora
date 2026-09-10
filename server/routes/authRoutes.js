import { Router } from "express";
import { login, logout } from "../controllers/authController.js";
import { validateLogin } from "../middleware/validateLogin.js";

const router = Router();

router.post("/login", validateLogin, login);
router.post("/logout", logout);

export default router;
