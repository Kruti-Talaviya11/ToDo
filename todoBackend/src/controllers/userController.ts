import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import * as userService from "../services/userService";

// ADMIN: get all users
export const getAllUsers = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  },
);

// ADMIN: get user by id
export const getUser = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const user = await userService.findUserById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    delete (user as any).password;

    return res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

// USER: get own profile
export const getMe = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const user = await userService.getMe(req.user!._id);

    return res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

// ADMIN: update user
export const updateUser = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const updatedUser = await userService.updateUserById(
      req.params.id,
      req.body,
    );

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    return res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  },
);

// ADMIN: delete user
export const deleteUser = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const user = await userService.deleteUserById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
