import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import * as taskService from "../services/taskService";
import { TaskStatus } from "../models/taskModel";

// ADMIN: create task
export const createTask = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const task = await taskService.createTask(req.body);

    return res.status(201).json({
      status: "success",
      data: { task },
    });
  },
);

// ADMIN: get all tasks
export const getAllTasks = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const tasks = await taskService.getAllTasks();

    return res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    });
  },
);

// ADMIN / USER: get single task
export const getTask = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    // User can access only their task
    if (
      req.user!.role === "user" &&
      task.assignedTo.toString() !== req.user!._id.toString()
    ) {
      return next(new AppError("Unauthorized access", 403));
    }

    return res.status(200).json({
      status: "success",
      data: { task },
    });
  },
);

// USER: get own tasks
export const getMyTasks = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const tasks = await taskService.getTasksForUser(req.user!._id);

    return res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    });
  },
);

// USER: update task status
export const updateTaskStatus = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) return next(new AppError("Task not found", 404));
    const assignedUserId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id.toString()
        : task.assignedTo.toString();

    if (assignedUserId !== req.user!._id.toString()) {
      return next(new AppError("You can update only your tasks", 403));
    }

    const updatedTask = await taskService.updateTask(req.params.id, {
      status: req.body.status as TaskStatus,
    });

    return res.status(200).json({
      status: "success",
      data: { task: updatedTask },
    });
  },
);

// ADMIN: update task
export const updateTask = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const task = await taskService.updateTask(req.params.id, req.body);

    return res.status(200).json({
      status: "success",
      data: { task },
    });
  },
);

// ADMIN: delete task
export const deleteTask = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    await taskService.deleteTask(req.params.id);

    return res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
