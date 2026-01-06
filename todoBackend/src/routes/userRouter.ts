import express, { Router } from "express";
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import { USER_TYPE } from "../utils/constant";
import { sendEmail } from "../utils/email";

const router: Router = express.Router();

// Auth
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.protect, authController.logout);
router.post("/refresh-token", authController.refreshToken);

router.get("/test-email", async (req, res) => {
  await sendEmail({
    to: "talaviyakruti@gmail.com",
    subject: "Test Email",
    message: "If you received this, SMTP works.",
  });

  res.status(200).json({ status: "success" });
});

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protected routes
router.use(authController.protect);

// USER
router.get("/me", userController.getMe);

// ADMIN
router.use(authController.restrictTo(USER_TYPE.ADMIN));
router.use("/admin-only", userController.adminonly);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
