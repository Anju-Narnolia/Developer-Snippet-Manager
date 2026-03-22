const express = require("express");
const router = express.Router();
const Snippet = require("../model/Snippet");
const authMiddleware = require("../middleware/auth");

// GET all snippets
router.get("/all", async (req, res) => {
  try {
    const snippets = await Snippet.find().sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET snippets for current user
router.get("/user/snippets", authMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new snippet (requires authentication)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    let authorName = req.body?.author?.name || "";
    let authorEmail = req.body?.author?.email || "";
    if (typeof authorName !== "string" || authorName.trim() === "") {
      authorName = "anonymous";
    }
    if (typeof authorEmail !== "string" || authorEmail.trim() === "") {
      authorEmail = "anonymous@example.com";
    }
    const snippetData = {
      title: req.body.title || "",
      description: req.body.description || "",
      language: req.body.language || "javascript",
      code: req.body.code || "",
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      userId: req.userId || null,
      author: {
        name: authorName, // Always a string, never empty
        email: authorEmail,
      },
    };
    const snippet = new Snippet(snippetData);
    console.log("New snippet");
    const newSnippet = await snippet.save();
    await newSnippet.populate("userId", "name email job");
    res.status(201).json(newSnippet);
  } catch (error) {
    console.error(
      "Snippet creation error:",
      error instanceof Error ? error.message : error,
    );
    console.error("Full error:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// UPDATE a snippet (requires authentication and ownership)
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, language, code, tags, likes, views, liked } =
    req.body;

  try {
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    // Allow updating views and likes without ownership
    if (likes !== undefined || views !== undefined || liked !== undefined) {
      if (likes !== undefined) snippet.likes = likes;
      if (views !== undefined) snippet.views = views;
      if (liked !== undefined) snippet.liked = liked;
      await snippet.save();
      await snippet.populate("userId", "name email job");
      return res.json(snippet);
    }

    // For content updates, check ownership
    if (title || description || language || code || tags) {
      if (snippet.userId.toString() !== req.userId) {
        return res.status(403).json({
          message: "Unauthorized - you can only edit your own snippets",
        });
      }
      const updatedSnippet = await Snippet.findByIdAndUpdate(
        id,
        { title, description, language, code, tags },
        { new: true },
      ).populate("userId", "name email job");
      return res.json(updatedSnippet);
    }
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a snippet (requires authentication and ownership)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (snippet.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Unauthorized - you can only delete your own snippets",
      });
    }

    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: "Snippet deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
