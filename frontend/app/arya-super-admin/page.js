"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEFAULT_FIELDS = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "category", label: "Category", type: "select" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "originalLanguage", label: "Original Language", type: "text" },
  { key: "author", label: "Author/Rishi", type: "text" },
  { key: "year", label: "Year/Era", type: "text" },
  { key: "verses", label: "Number of Verses", type: "number" },
  { key: "chapters", label: "Number of Chapters", type: "number" },
];

export default function AdminPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState("list");
  const [selectedBook, setSelectedBook] = useState(null);
  const [enabledFields, setEnabledFields] = useState([
    "title",
    "category",
    "description",
  ]);
  const [bookForm, setBookForm] = useState({});
  const [translationForm, setTranslationForm] = useState({
    translatorName: "",
    language: "",
    content: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalTranslations: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      const bookList = Array.isArray(data) ? data : [];
      setBooks(bookList);
      updateStats(bookList);
    } catch {
      setBooks([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const updateStats = (bookList) => {
    setStats((prev) => ({
      ...prev,
      totalBooks: bookList.length,
      totalTranslations: bookList.reduce(
        (acc, b) => acc + (b.translations?.length || 0),
        0
      ),
    }));
  };

  useEffect(() => {
    setStats((prev) => ({ ...prev, totalCategories: categories.length }));
  }, [categories]);

  const toggleField = (key) => {
    if (key === "title") return;
    setEnabledFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    enabledFields.forEach((key) => {
      if (bookForm[key]) formData.append(key, bookForm[key]);
    });
    formData.append("enabledFields", JSON.stringify(enabledFields));

    const url = selectedBook ? `/api/books/${selectedBook._id}` : "/api/books";
    await fetch(url, { method: selectedBook ? "PUT" : "POST", body: formData });
    resetForm();
    fetchBooks();
  };

  const handleTranslationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(translationForm).forEach((key) =>
      formData.append(key, translationForm[key])
    );

    await fetch(`/api/books/${selectedBook._id}/translations`, {
      method: "POST",
      body: formData,
    });
    setTranslationForm({ translatorName: "", language: "", content: "" });
    fetchBooks();
    const res = await fetch(`/api/books/${selectedBook._id}`);
    setSelectedBook(await res.json());
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const url = editingCategory
      ? `/api/categories/${editingCategory._id}`
      : "/api/categories";
    const method = editingCategory ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    setCategoryForm({ name: "", description: "" });
    setEditingCategory(null);
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || "" });
  };

  const deleteTranslation = async (translationId) => {
    if (!confirm("Delete this translation?")) return;
    await fetch(
      `/api/books/${selectedBook._id}/translations/${translationId}`,
      { method: "DELETE" }
    );
    fetchBooks();
    const res = await fetch(`/api/books/${selectedBook._id}`);
    setSelectedBook(await res.json());
  };

  const deleteBook = async (id) => {
    if (!confirm("Delete this book and all translations?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  const resetForm = () => {
    setView("list");
    setSelectedBook(null);
    setBookForm({});
    setEnabledFields(["title", "category", "description"]);
  };

  const startEdit = (book) => {
    setSelectedBook(book);
    setBookForm(book);
    setEnabledFields(
      book.enabledFields || ["title", "category", "description"]
    );
    setView("editBook");
  };

  const startAddBook = () => {
    setSelectedBook(null);
    setBookForm({});
    setEnabledFields(["title", "category", "description"]);
    setView("addBook");
    setActiveTab("add");
  };

  const manageTranslations = (book) => {
    setSelectedBook(book);
    setView("manageTranslations");
  };

  const getCategoryOptions = () => categories.map((c) => c.name);

  const styles = {
    layout: { display: "flex", minHeight: "100vh" },
    sidebar: {
      width: "260px",
      background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
      color: "white",
      position: "fixed",
      height: "100vh",
      left: 0,
      top: 0,
    },
    sidebarHeader: {
      padding: "1.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.85rem 1.5rem",
      cursor: "pointer",
      background: active ? "rgba(255,255,255,0.1)" : "transparent",
      borderLeft: active ? "3px solid #f97316" : "3px solid transparent",
      transition: "all 0.2s",
      fontSize: "0.95rem",
    }),
    main: {
      flex: 1,
      marginLeft: "260px",
      background: "#f8fafc",
      minHeight: "100vh",
    },
    topBar: {
      background: "white",
      padding: "1rem 2rem",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    content: { padding: "2rem" },
    card: {
      background: "white",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      marginBottom: "0.75rem",
      borderRadius: "8px",
      border: "1px solid #e5e5e5",
      fontSize: "0.95rem",
    },
    btn: {
      padding: "0.6rem 1.2rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.9rem",
    },
    statCard: {
      background: "white",
      borderRadius: "12px",
      padding: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    checkbox: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem",
      background: "#f9f9f9",
      borderRadius: "6px",
      cursor: "pointer",
      marginBottom: "0.5rem",
    },
  };

  const Sidebar = () => (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
          📚 Sacred Texts
        </h2>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
          Admin Panel
        </p>
      </div>
      <nav style={{ padding: "1rem 0" }}>
        <div
          style={styles.navItem(activeTab === "dashboard")}
          onClick={() => {
            setActiveTab("dashboard");
            setView("list");
          }}
        >
          <span>📊</span> Dashboard
        </div>
        <div
          style={styles.navItem(activeTab === "books")}
          onClick={() => {
            setActiveTab("books");
            setView("list");
          }}
        >
          <span>📖</span> All Books
        </div>
        <div style={styles.navItem(activeTab === "add")} onClick={startAddBook}>
          <span>➕</span> Add New Book
        </div>
        <div
          style={styles.navItem(activeTab === "categories")}
          onClick={() => {
            setActiveTab("categories");
            setView("list");
          }}
        >
          <span>🏷️</span> Categories
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            margin: "1rem 0",
          }}
        />
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={styles.navItem(false)}>
            <span>🌐</span> View Website
          </div>
        </Link>
      </nav>
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1.5rem",
          right: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "1rem",
            fontSize: "0.8rem",
          }}
        >
          <p style={{ margin: 0, opacity: 0.8 }}>Logged in as</p>
          <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>Admin</p>
        </div>
      </div>
    </aside>
  );

  const TopBar = ({ title, action }) => (
    <div style={styles.topBar}>
      <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#1f2937" }}>
        {title}
      </h1>
      {action}
    </div>
  );

  // DASHBOARD VIEW
  const DashboardView = () => (
    <>
      <TopBar title="Dashboard" />
      <div style={styles.content}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={styles.statCard}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Total Books
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "2rem",
                fontWeight: 700,
                color: "#4f46e5",
              }}
            >
              {stats.totalBooks}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Total Translations
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "2rem",
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              {stats.totalTranslations}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Categories
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "2rem",
                fontWeight: 700,
                color: "#f59e0b",
              }}
            >
              {stats.totalCategories}
            </p>
          </div>
        </div>
        <div style={styles.card}>
          <h3 style={{ margin: "0 0 1rem", color: "#1f2937" }}>Recent Books</h3>
          {books.slice(0, 5).map((book) => (
            <div
              key={book._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: "#1f2937" }}>
                  {book.title}
                </p>
                <p
                  style={{
                    margin: "0.2rem 0 0",
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  {book.category}
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                {book.translations?.length || 0} translations
              </span>
            </div>
          ))}
          {books.length === 0 && (
            <p style={{ color: "#6b7280" }}>No books yet</p>
          )}
        </div>
      </div>
    </>
  );

  // CATEGORIES VIEW
  const CategoriesView = () => (
    <>
      <TopBar title="Categories" />
      <div style={styles.content}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 1rem", color: "#1f2937" }}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <form onSubmit={handleCategorySubmit}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Category Name *
              </label>
              <input
                placeholder="e.g., Vedas, Upanishads"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
                style={styles.input}
              />
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Description
              </label>
              <textarea
                placeholder="Brief description of this category..."
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                rows={3}
                style={{ ...styles.input, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  style={{
                    ...styles.btn,
                    background: "#4f46e5",
                    color: "white",
                  }}
                >
                  {editingCategory ? "Update" : "Add Category"}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: "", description: "" });
                    }}
                    style={{ ...styles.btn, background: "#f3f4f6" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 1rem", color: "#1f2937" }}>
              All Categories ({categories.length})
            </h3>
            {categories.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                No categories yet. Add your first one!
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <p
                        style={{ margin: 0, fontWeight: 500, color: "#1f2937" }}
                      >
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.8rem",
                            color: "#6b7280",
                          }}
                        >
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => startEditCategory(cat)}
                        style={{
                          ...styles.btn,
                          background: "#fef3c7",
                          color: "#92400e",
                          fontSize: "0.8rem",
                          padding: "0.4rem 0.8rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat._id)}
                        style={{
                          ...styles.btn,
                          background: "#fee2e2",
                          color: "#dc2626",
                          fontSize: "0.8rem",
                          padding: "0.4rem 0.8rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // BOOKS LIST VIEW
  const BooksListView = () => (
    <>
      <TopBar
        title="All Books"
        action={
          <button
            onClick={startAddBook}
            style={{ ...styles.btn, background: "#4f46e5", color: "white" }}
          >
            + Add New Book
          </button>
        }
      />
      <div style={styles.content}>
        {books.length === 0 ? (
          <div style={{ ...styles.card, textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              No books yet. Add your first sacred text!
            </p>
            <button
              onClick={startAddBook}
              style={{ ...styles.btn, background: "#4f46e5", color: "white" }}
            >
              + Add Book
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {books.map((book) => (
              <div key={book._id} style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "#ede9fe",
                        color: "#7c3aed",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      {book.category || "Uncategorized"}
                    </span>
                    <h3
                      style={{ margin: "0.5rem 0 0.25rem", color: "#1f2937" }}
                    >
                      {book.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      {book.translations?.length || 0} translation(s)
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => manageTranslations(book)}
                      style={{
                        ...styles.btn,
                        background: "#ede9fe",
                        color: "#7c3aed",
                      }}
                    >
                      Translations
                    </button>
                    <button
                      onClick={() => startEdit(book)}
                      style={{
                        ...styles.btn,
                        background: "#fef3c7",
                        color: "#92400e",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBook(book._id)}
                      style={{
                        ...styles.btn,
                        background: "#fee2e2",
                        color: "#dc2626",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ADD/EDIT BOOK VIEW
  const BookFormView = () => (
    <>
      <TopBar title={selectedBook ? "Edit Book" : "Add New Book"} />
      <div style={styles.content}>
        <button
          onClick={resetForm}
          style={{ ...styles.btn, background: "#f3f4f6", marginBottom: "1rem" }}
        >
          ← Back to Books
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 1.5rem", color: "#1f2937" }}>
              Book Details
            </h3>
            <form onSubmit={handleBookSubmit}>
              {DEFAULT_FIELDS.filter((f) => enabledFields.includes(f.key)).map(
                (field) => (
                  <div key={field.key} style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.4rem",
                        fontSize: "0.85rem",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span style={{ color: "#dc2626" }}>*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={bookForm[field.key] || ""}
                        onChange={(e) =>
                          setBookForm({
                            ...bookForm,
                            [field.key]: e.target.value,
                          })
                        }
                        rows={4}
                        style={{ ...styles.input, resize: "vertical" }}
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={bookForm[field.key] || ""}
                        onChange={(e) =>
                          setBookForm({
                            ...bookForm,
                            [field.key]: e.target.value,
                          })
                        }
                        style={styles.input}
                      >
                        <option value="">Select {field.label}</option>
                        {getCategoryOptions().map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={bookForm[field.key] || ""}
                        onChange={(e) =>
                          setBookForm({
                            ...bookForm,
                            [field.key]: e.target.value,
                          })
                        }
                        style={styles.input}
                        required={field.required}
                      />
                    )}
                  </div>
                )
              )}
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}
              >
                <button
                  type="submit"
                  style={{
                    ...styles.btn,
                    background: "#4f46e5",
                    color: "white",
                  }}
                >
                  {selectedBook ? "Update Book" : "Create Book"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ ...styles.btn, background: "#f3f4f6" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <div style={styles.card}>
            <h3
              style={{
                margin: "0 0 0.5rem",
                color: "#1f2937",
                fontSize: "1rem",
              }}
            >
              Field Options
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              Toggle fields for this book
            </p>
            {DEFAULT_FIELDS.map((field) => (
              <label
                key={field.key}
                style={{
                  ...styles.checkbox,
                  opacity: field.required ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={enabledFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                  disabled={field.required}
                />
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>
                  {field.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // TRANSLATIONS VIEW
  const TranslationsView = () => (
    <>
      <TopBar title={`Translations: ${selectedBook?.title}`} />
      <div style={styles.content}>
        <button
          onClick={resetForm}
          style={{ ...styles.btn, background: "#f3f4f6", marginBottom: "1rem" }}
        >
          ← Back to Books
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 1rem", color: "#1f2937" }}>
              Add Translation
            </h3>
            <form onSubmit={handleTranslationSubmit}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Translator Name *
              </label>
              <input
                placeholder="e.g., Swami Vivekananda"
                value={translationForm.translatorName}
                onChange={(e) =>
                  setTranslationForm({
                    ...translationForm,
                    translatorName: e.target.value,
                  })
                }
                required
                style={styles.input}
              />
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Language *
              </label>
              <input
                placeholder="e.g., English, Hindi"
                value={translationForm.language}
                onChange={(e) =>
                  setTranslationForm({
                    ...translationForm,
                    language: e.target.value,
                  })
                }
                required
                style={styles.input}
              />
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Content
              </label>
              <textarea
                placeholder="Enter translation text..."
                value={translationForm.content}
                onChange={(e) =>
                  setTranslationForm({
                    ...translationForm,
                    content: e.target.value,
                  })
                }
                rows={8}
                style={{ ...styles.input, resize: "vertical" }}
              />
              <button
                type="submit"
                style={{
                  ...styles.btn,
                  background: "#7c3aed",
                  color: "white",
                  width: "100%",
                }}
              >
                Add Translation
              </button>
            </form>
          </div>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 1rem", color: "#1f2937" }}>
              Existing ({selectedBook?.translations?.length || 0})
            </h3>
            {selectedBook?.translations?.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                No translations yet
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {selectedBook?.translations?.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <p
                        style={{ margin: 0, fontWeight: 500, color: "#1f2937" }}
                      >
                        {t.translatorName}
                      </p>
                      <p
                        style={{
                          margin: "0.2rem 0 0",
                          fontSize: "0.8rem",
                          color: "#6b7280",
                        }}
                      >
                        {t.language}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTranslation(t._id)}
                      style={{
                        ...styles.btn,
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // MAIN RENDER
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        {activeTab === "dashboard" && view === "list" && <DashboardView />}
        {activeTab === "books" && view === "list" && <BooksListView />}
        {activeTab === "categories" && view === "list" && <CategoriesView />}
        {(activeTab === "add" || view === "addBook" || view === "editBook") && (
          <BookFormView />
        )}
        {view === "manageTranslations" && <TranslationsView />}
      </main>
    </div>
  );
}
