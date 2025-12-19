const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema({
  translatorName: { type: String, required: true },
  language: { type: String, required: true },
  content: { type: String },
  fileUrl: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "Other" },
  description: { type: String },
  originalLanguage: { type: String },
  author: { type: String },
  year: { type: String },
  verses: { type: Number },
  chapters: { type: Number },
  customFields: { type: Map, of: String },
  translations: [translationSchema],
  coverImage: { type: String },
  enabledFields: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Book", bookSchema);
