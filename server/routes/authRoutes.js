import { Router } from "express";
import {
    getSession,
    loginClient,
    logout,
    signupClient,
} from "../controllers/authController.js";
import { validateLogin } from "../middleware/validateLogin.js";
import { validateSignup } from "../middleware/validateSignup.js";

const router = Router();

router.post("/login", validateLogin, loginClient);
router.post("/signup", validateSignup, signupClient);
router.post("/logout", logout);
router.get("/session", getSession);

export default router;
