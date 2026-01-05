import { User, IUser } from "../models/userModel";
import mongoose from "mongoose";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

export const createUser = async ({
  name,
  email,
  password,
  role = "user",
}: CreateUserInput): Promise<any> => {
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return user;
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select("+password");
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById({ _id: id, active: true }).select("+accessToken");
};

export const getAllUsers = async (): Promise<any[]> => {
  return await User.find({ active: true }).select("-password");
};

export const updateUserById = async (
  userId: string,
  updateData: Partial<{
    name: string;
    email: string;
    role: "user" | "admin";
  }>,
): Promise<any> => {
  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

export const deleteUserById = async (userId: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(userId);
};

export const deactivateUserById = async (
  userId: string,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, { active: false }, { new: true });
};

export const getMe = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  return await User.findById(userId).select("-password");
};

export const saveAccessToken = async (
  userId: string,
  token: string,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { accessToken: token },
    { validateBeforeSave: false, new: true },
  );
};

export const clearAccessToken = async (userId: string): Promise<any> => {
  return await User.findByIdAndUpdate(
    userId,
    { accessToken: "null" },
    { validateBeforeSave: false, new: true },
  );
};

const userService = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  getMe,
  deleteUserById,
  updateUserById,
  saveAccessToken,
  clearAccessToken,
  deactivateUserById,
};

export default userService;
