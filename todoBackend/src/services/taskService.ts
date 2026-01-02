import { Task } from "../models/taskModel";
import mongoose from "mongoose";

interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo: mongoose.Types.ObjectId;
  dueDate: Date;
  status?: string;
}

export const createTask = async (data: CreateTaskInput): Promise<any> => {
  return await Task.create(data);
};

export const getAllTasks = async (): Promise<any[]> => {
  return await Task.find().populate("assignedTo", "name email role");
};

export const getTaskById = async (taskId: string): Promise<any> => {
  return await Task.findById(taskId).populate("assignedTo", "name email");
};

export const getTasksForUser = async (
  userId: mongoose.Types.ObjectId,
): Promise<any[]> => {
  return await Task.find({ assignedTo: userId });
};

export const updateTask = async (
  taskId: string,
  updateData: Partial<CreateTaskInput>,
): Promise<any> => {
  return await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteTask = async (taskId: string): Promise<any> => {
  return await Task.findByIdAndDelete(taskId);
};
