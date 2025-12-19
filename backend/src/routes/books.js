const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get all books
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const books = await Book.find(filter).select("-translations.content");
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single book with all translations
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new book (Admin)
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      originalLanguage,
      author,
      year,
      verses,
      chapters,
      enabledFields,
    } = req.body;
    const book = new Book({
      title,
      category,
      description,
      originalLanguage,
      author,
      year,
      verses: verses ? Number(verses) : undefined,
      chapters: chapters ? Number(chapters) : undefined,
      enabledFields: enabledFields ? JSON.parse(enabledFields) : undefined,
      coverImage: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update book (Admin)
router.put("/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      originalLanguage,
      author,
      year,
      verses,
      chapters,
      enabledFields,
    } = req.body;
    const updateData = {
      title,
      category,
      description,
      originalLanguage,
      author,
      year,
      verses: verses ? Number(verses) : undefined,
      chapters: chapters ? Number(chapters) : undefined,
      enabledFields: enabledFields ? JSON.parse(enabledFields) : undefined,
    };
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete book (Admin)
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add translation to a book (Admin)
router.post("/:id/translations", upload.single("file"), async (req, res) => {
  try {
    const { translatorName, language, content } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    book.translations.push({
      translatorName,
      language,
      content,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update translation
router.put("/:id/translations/:translationId", async (req, res) => {
  try {
    const { translatorName, language, content } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const translation = book.translations.id(req.params.translationId);
    if (!translation)
      return res.status(404).json({ error: "Translation not found" });

    if (translatorName) translation.translatorName = translatorName;
    if (language) translation.language = language;
    if (content) translation.content = content;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete translation
router.delete("/:id/translations/:translationId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    book.translations.pull(req.params.translationId);
    await book.save();
    res.json({ message: "Translation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
