const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", protect, async (req, res) => {
  try {

    const userTasks = await Task.find({
      $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
    })
      .populate("project", "name")
      .populate("assignedTo", "name")
      .sort({ dueDate: 1 });

    const now = new Date();


    const totalTasks = userTasks.length;
    const todoTasks = userTasks.filter((t) => t.status === "todo").length;
    const inProgressTasks = userTasks.filter((t) => t.status === "in-progress").length;
    const doneTasks = userTasks.filter((t) => t.status === "done").length;
    const overdueTasks = userTasks.filter(
      (t) => t.status !== "done" && new Date(t.dueDate) < now
    ).length;


    const recentTasks = userTasks.slice(0, 10);

    res.json({
      stats: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks,
      },
      recentTasks,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "Title, project, assignedTo, and dueDate are required",
      });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description: description || "",
      project,
      assignedTo,
      dueDate,
      createdBy: req.user._id,
    });


    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .populate("createdBy", "name");

    res.status(201).json({ message: "Task created", task: populatedTask });
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", protect, async (req, res) => {
  try {
    let filter = {};


    if (req.query.project) {
      filter.project = req.query.project;
    } else {

      filter = {
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
      };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        message: "You can only update tasks assigned to you",
      });
    }

    // members can only update status
    if (!isAdmin) {
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // admin can update everything
      if (req.body.title) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.status) task.status = req.body.status;
      if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
      if (req.body.dueDate) task.dueDate = req.body.dueDate;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .populate("createdBy", "name");

    res.json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id - delete a task (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
