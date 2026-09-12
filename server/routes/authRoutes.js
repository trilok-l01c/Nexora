import { Router } from "express";
import {
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

export default router;
