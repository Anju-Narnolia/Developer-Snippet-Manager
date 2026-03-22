const mongoose = require("mongoose");

const SnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  language: {
    type: String,
    required: true,
  },

  code: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  author: {
    name: {
      type: String,
      default: "anonymous",
    },
    email: {
      type: String,
      default: "anonymous@example.com",
    },
    job: {
      type: String,
      default: "developer",
    },
  },
  likes: {
    type: Number,
    default: 0,
  },

  views: {
    type: Number,
    default: 0,
  },

  liked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Snippet", SnippetSchema);
