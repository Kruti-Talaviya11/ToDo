"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasksForUser = exports.getTaskById = exports.getAllTasks = exports.createTask = void 0;
const taskModel_1 = require("../models/taskModel");
const createTask = async (data) => {
    return await taskModel_1.Task.create(data);
};
exports.createTask = createTask;
const getAllTasks = async () => {
    return await taskModel_1.Task.find().populate("assignedTo", "name email role");
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (taskId) => {
    return await taskModel_1.Task.findById(taskId).populate("assignedTo", "name email");
};
exports.getTaskById = getTaskById;
const getTasksForUser = async (userId) => {
    return await taskModel_1.Task.find({ assignedTo: userId });
};
exports.getTasksForUser = getTasksForUser;
const updateTask = async (taskId, updateData) => {
    return await taskModel_1.Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true
    });
};
exports.updateTask = updateTask;
const deleteTask = async (taskId) => {
    return await taskModel_1.Task.findByIdAndDelete(taskId);
};
exports.deleteTask = deleteTask;
