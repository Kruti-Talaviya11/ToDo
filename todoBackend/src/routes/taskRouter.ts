import express from "express";
import * as taskController from "../controllers/taskController";
import { protect, restrictTo } from "../controllers/authController";

const router = express.Router();

router.use(protect);

// USER routes
router.get("/my-tasks", restrictTo("user"), taskController.getMyTasks);
router.patch(
  "/:id/status",
  restrictTo("user"),
  taskController.updateTaskStatus,
);

// ADMIN routes
router
  .route("/")
  .post(restrictTo("admin"), taskController.createTask)
  .get(restrictTo("admin"), taskController.getAllTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(restrictTo("admin"), taskController.updateTask)
  .delete(restrictTo("admin"), taskController.deleteTask);

export default router;
