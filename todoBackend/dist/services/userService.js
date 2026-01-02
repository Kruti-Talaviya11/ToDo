"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAccessToken = exports.saveAccessToken = exports.getMe = exports.deleteUserById = exports.updateUserById = exports.getAllUsers = exports.findUserById = exports.findUserByEmail = exports.createUser = void 0;
const userModel_1 = require("../models/userModel");
const createUser = async ({ name, email, password, role = "user" }) => {
    const user = await userModel_1.User.create({
        name,
        email,
        password,
        role
    });
    return user;
};
exports.createUser = createUser;
const findUserByEmail = async (email) => {
    return await userModel_1.User.findOne({ email }).select("+password");
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return await userModel_1.User.findById(id);
};
exports.findUserById = findUserById;
const getAllUsers = async () => {
    return await userModel_1.User.find().select("-password");
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (userId, updateData) => {
    return await userModel_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }).select("-password");
};
exports.updateUserById = updateUserById;
const deleteUserById = async (userId) => {
    return await userModel_1.User.findByIdAndDelete(userId);
};
exports.deleteUserById = deleteUserById;
const getMe = async (userId) => {
    return await userModel_1.User.findById(userId).select("-password");
};
exports.getMe = getMe;
const saveAccessToken = async (userId, token) => {
    return await userModel_1.User.findByIdAndUpdate(userId, { accessToken: token }, { validateBeforeSave: false, new: true });
};
exports.saveAccessToken = saveAccessToken;
const clearAccessToken = async (userId) => {
    return await userModel_1.User.findByIdAndUpdate(userId, { accessToken: "null" }, { validateBeforeSave: false, new: true });
};
exports.clearAccessToken = clearAccessToken;
const userService = {
    createUser: exports.createUser,
    findUserByEmail: exports.findUserByEmail,
    findUserById: exports.findUserById,
    getAllUsers: exports.getAllUsers,
    getMe: exports.getMe,
    deleteUserById: exports.deleteUserById,
    updateUserById: exports.updateUserById,
    saveAccessToken: exports.saveAccessToken,
    clearAccessToken: exports.clearAccessToken
};
exports.default = userService;
