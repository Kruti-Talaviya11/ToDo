import express from "express";
import * as taskController from "../controllers/taskController";
import { protect, restrictTo } from "../controllers/authController";
import { USER_TYPE } from "../utils/constant";

const router = express.Router();

router.use(protect);

// USER routes
router.get("/my-tasks", restrictTo(USER_TYPE.USER), taskController.getMyTasks);
router.patch(
  "/:id/status",
  restrictTo("user"),
  taskController.updateTaskStatus,
);

// ADMIN routes
router
  .route("/")
  .post(restrictTo(USER_TYPE.ADMIN), taskController.createTask)
  .get(restrictTo(USER_TYPE.ADMIN), taskController.getAllTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(restrictTo(USER_TYPE.ADMIN), taskController.updateTask)
  .delete(restrictTo(USER_TYPE.ADMIN), taskController.deleteTask);

export default router;
