import mongoose, { Document, Schema } from "mongoose";

export enum TaskStatus {
  PENDING = "pending",
  ONGOING = "ongoing",
  COMPLETED = "completed",
}

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
