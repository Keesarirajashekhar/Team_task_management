const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/projects - create a new project (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description: description || "",
      admin: req.user._id,
      members: [req.user._id], // admin is also a member
    });

    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error("Create project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/projects - get all projects for the logged in user
router.get("/", protect, async (req, res) => {
  try {
    // find projects where user is either admin or a member
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    })
      .populate("admin", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/projects/:id - get single project details
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("admin", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("Get project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/projects/:id - update project (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // only the project admin can update it
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project admin can update this" });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    res.json({ message: "Project updated", project });
  } catch (error) {
    console.error("Update project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/projects/:id - delete project (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project admin can delete this" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Delete project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/projects/:id/members - add a member to project (admin only)
router.post("/:id/members", protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project admin can add members" });
    }

    // find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // check if already a member
    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member of this project" });
    }

    project.members.push(userToAdd._id);
    await project.save();

    // return updated project with populated members
    const updatedProject = await Project.findById(req.params.id)
      .populate("admin", "name email")
      .populate("members", "name email role");

    res.json({ message: "Member added successfully", project: updatedProject });
  } catch (error) {
    console.error("Add member error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
