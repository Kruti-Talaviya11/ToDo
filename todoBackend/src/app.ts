// const express = require("express");
// const cors = require("cors");
// const userRouter = require('./routes/userRouter');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Todo RBAC API Running");
// });
// app.use("/api/user",userRouter)

// module.exports = app;

import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
import taskRouter from "./routes/taskRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/user/task", taskRouter);
app.use("/api/user", userRouter);

export default app;
