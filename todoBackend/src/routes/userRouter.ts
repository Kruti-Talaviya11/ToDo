import express, { Router } from "express";
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";

const router: Router = express.Router();

// Auth
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.protect, authController.logout);

// Protected routes
router.use(authController.protect);

// USER
router.get("/me", userController.getMe);

// ADMIN
router.use(authController.restrictTo("admin"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
