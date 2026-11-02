import mongoose from "mongoose";
import { Post } from "../models/post.model.js";

const createPost = async (req, res) => {
  try {
    const { name, description, age } = req.body || {};

    if (!name || !description || age === undefined) {
      return res.status(400).json({ message: "Name, description, and age are required" });
    }

    const post = await Post.create({ name, description, age });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Create post error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, age } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    if (name === undefined && description === undefined && age === undefined) {
      return res.status(400).json({ message: "Provide name, description, or age to update" });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { name, description, age },
      { returnDocument: "after", runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post updated", post });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Update post error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createPost, getPosts, updatePost, deletePost };
