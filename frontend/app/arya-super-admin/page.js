"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Library,
  LayoutDashboard,
  BookText,
  PlusCircle,
  Tags,
  Globe,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Save,
  X,
  LayoutList,
  Tag,
  Inbox,
  Calendar,
  Scroll,
  BookOpen,
  ArrowLeft,

  User,
  Settings,
  Lightbulb,
  List,
  Book,
  Check,
  ChevronRight
} from "lucide-react";

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
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
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
    // Check authentication
    const token = localStorage.getItem("adminToken");
    const username = localStorage.getItem("adminUsername");
    if (!token) {
      router.push("/arya-super-admin/login");
      return;
    }
    setIsAuthenticated(true);
    setAdminUsername(username || "Admin");
    fetchBooks();
    fetchCategories();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    router.push("/arya-super-admin/login");
  };

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
    if (!bookForm.title || !bookForm.title.trim()) {
      alert("Title is required");
      return;
    }
    const formData = new FormData();
    enabledFields.forEach((key) => {
      if (bookForm[key] !== undefined && bookForm[key] !== null) {
        formData.append(key, bookForm[key]);
      }
    });
    formData.append("enabledFields", JSON.stringify(enabledFields));

    const url = selectedBook ? `/api/books/${selectedBook._id}` : "/api/books";
    const isCreating = !selectedBook;
    try {
      const res = await fetch(url, {
        method: selectedBook ? "PUT" : "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to save book"}`);
        return;
      }
      if (isCreating) {
        alert("Book created successfully!");
      }
      resetForm();
      fetchBooks();
    } catch (error) {
      alert(`Network error: ${error.message}`);
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Library size={24} style={{ color: "#fbbf24" }} />
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
            Sacred Texts
          </h2>
        </div>
        <p style={{ margin: "0.25rem 0 0 2.25rem", fontSize: "0.8rem", opacity: 0.7 }}>
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
          <LayoutDashboard size={20} /> Dashboard
        </div>
        <div
          style={styles.navItem(activeTab === "books")}
          onClick={() => {
            setActiveTab("books");
            setView("list");
          }}
        >
          <BookText size={20} /> All Books
        </div>
        <div style={styles.navItem(activeTab === "add")} onClick={startAddBook}>
          <PlusCircle size={20} /> Add New Book
        </div>
        <div
          style={styles.navItem(activeTab === "categories")}
          onClick={() => {
            setActiveTab("categories");
            setView("list");
          }}
        >
          <Tags size={20} /> Categories
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            margin: "1rem 0",
          }}
        />
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={styles.navItem(false)}>
            <Globe size={20} /> View Website
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
          <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>
            {adminUsername}
          </p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "0.75rem",
              width: "100%",
              padding: "0.5rem",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <LogOut size={16} /> Logout
          </button>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              <BookText size={18} />
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Total Books</p>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 700,
                color: "#4f46e5",
              }}
            >
              {stats.totalBooks}
            </p>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              <Globe size={18} />
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Total Translations</p>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              {stats.totalTranslations}
            </p>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              <Tags size={18} />
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Categories</p>
            </div>
            <p
              style={{
                margin: 0,
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                  <Tag size={12} color="#6b7280" />
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    {book.category}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#6b7280" }}>
                <Globe size={14} />
                <span>{book.translations?.length || 0} translations</span>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
              <Inbox size={18} />
              <p style={{ margin: 0 }}>No books yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // CATEGORIES VIEW - rendered inline to prevent re-mount on state change
  const renderCategoriesView = () => {
    const catStyles = {
      container: {
        padding: "2rem",
        maxWidth: "1600px",
        margin: "0 auto",
      },
      header: {
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
      titleBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      },
      title: {
        color: "#1e293b",
        fontSize: "1.875rem",
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.025em",
      },
      subtitle: {
        color: "#64748b",
        fontSize: "0.95rem",
        margin: 0,
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: "2rem",
        alignItems: "start",
      },
      formCard: {
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        position: "sticky",
        top: "2rem",
      },
      listCard: {
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        minHeight: "500px",
      },
      sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #e2e8f0",
      },
      sectionIcon: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        background: "#fff7ed",
        color: "#ea580c",
      },
      sectionHeading: {
        margin: 0,
        color: "#1e293b",
        fontSize: "1.125rem",
        fontWeight: 600,
      },
      label: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.5rem",
        fontSize: "0.875rem",
        color: "#475569",
        fontWeight: 600,
      },
      input: {
        width: "100%",
        padding: "0.75rem 1rem",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "0.95rem",
        outline: "none",
        background: "#fff",
        marginBottom: "1.25rem",
        transition: "all 0.2s ease",
        color: "#1e293b",
      },
      textarea: {
        width: "100%",
        padding: "0.75rem 1rem",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "0.95rem",
        outline: "none",
        background: "#fff",
        marginBottom: "1.5rem",
        resize: "vertical",
        minHeight: "120px",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        color: "#1e293b",
      },
      submitBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.875rem",
        background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        border: "none",
        borderRadius: "10px",
        color: "white",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 6px -1px rgba(234, 88, 12, 0.2)",
      },
      cancelBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.875rem",
        marginTop: "0.75rem",
        background: "white",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        color: "#64748b",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
      },
      categoryItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        background: "#f8fafc",
        borderRadius: "12px",
        marginBottom: "0.75rem",
        border: "1px solid #e2e8f0",
        transition: "all 0.2s ease",
      },
      categoryInfo: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      },
      catIconBg: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #f1f5f9",
        color: "#f59e0b",
      },
      actionBtns: {
        display: "flex",
        gap: "0.5rem",
      },
      editBtn: {
        padding: "0.5rem",
        borderRadius: "8px",
        border: "none",
        background: "#e0f2fe",
        color: "#0284c7",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      deleteBtn: {
        padding: "0.5rem",
        borderRadius: "8px",
        border: "none",
        background: "#fee2e2",
        color: "#dc2626",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        color: "#64748b",
        textAlign: "center",
        background: "#f8fafc",
        borderRadius: "16px",
        border: "2px dashed #e2e8f0",
      },
    };

    return (
      <>
        <TopBar title="Categories Management" />
        <div style={catStyles.container}>
          <div style={catStyles.header}>
            <div style={catStyles.titleBlock}>
              <h1 style={catStyles.title}>Manage Categories</h1>
              <p style={catStyles.subtitle}>
                Create and organize your content categories
              </p>
            </div>
            <div style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              background: "white",
              padding: "0.5rem 1rem",
              borderRadius: "50px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <LayoutList size={18} color="#64748b" />
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Total Categories: <strong>{categories.length}</strong>
              </span>
            </div>
          </div>

          <div style={catStyles.grid}>
            {/* Form Section */}
            <div style={catStyles.formCard}>
              <div style={catStyles.sectionTitle}>
                <div style={catStyles.sectionIcon}>
                  {editingCategory ? <Pencil size={18} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 style={catStyles.sectionHeading}>
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h3>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    {editingCategory ? "Update details below" : "Add a new category"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCategorySubmit}>
                <label style={catStyles.label}>
                  <Tag size={16} /> Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  placeholder="e.g. History, Science, Vedas"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={catStyles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ea580c";
                    e.target.style.boxShadow = "0 0 0 3px rgba(234, 88, 12, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#cbd5e1";
                    e.target.style.boxShadow = "none";
                  }}
                />

                <label style={catStyles.label}>
                  <FileText size={16} /> Description
                </label>
                <textarea
                  placeholder="What is this category about?"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  style={catStyles.textarea}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#ea580c";
                    e.target.style.boxShadow = "0 0 0 3px rgba(234, 88, 12, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#cbd5e1";
                    e.target.style.boxShadow = "none";
                  }}
                />

                <button
                  type="submit"
                  style={catStyles.submitBtn}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {editingCategory ? <><Save size={18} /> Update Category</> : <><Plus size={18} /> Create Category</>}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: "", description: "" });
                    }}
                    style={catStyles.cancelBtn}
                    onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseOut={(e) => e.currentTarget.style.background = "white"}
                  >
                    <X size={18} /> Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* List Section */}
            <div style={catStyles.listCard}>
              <div style={catStyles.sectionTitle}>
                <div style={{ ...catStyles.sectionIcon, background: "#e0f2fe", color: "#0284c7" }}>
                  <Library size={20} />
                </div>
                <div>
                  <h3 style={catStyles.sectionHeading}>Existing Categories</h3>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    View and manage your list
                  </p>
                </div>
              </div>

              {categories.length === 0 ? (
                <div style={catStyles.emptyState}>
                  <div style={{ marginBottom: "1rem", opacity: 0.5 }}>
                    <Inbox size={48} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    No Categories Found
                  </p>
                  <p>Start by creating your first category using the form.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      style={catStyles.categoryItem}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={catStyles.categoryInfo}>
                        <div style={catStyles.catIconBg}>
                          <Tag size={20} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: "1rem" }}>
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={catStyles.actionBtns}>
                        <button
                          title="Edit"
                          onClick={() => startEditCategory(cat)}
                          style={catStyles.editBtn}
                          onMouseOver={(e) => e.currentTarget.style.background = "#bae6fd"}
                          onMouseOut={(e) => e.currentTarget.style.background = "#e0f2fe"}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => deleteCategory(cat._id)}
                          style={catStyles.deleteBtn}
                          onMouseOver={(e) => e.currentTarget.style.background = "#fecaca"}
                          onMouseOut={(e) => e.currentTarget.style.background = "#fee2e2"}
                        >
                          <Trash2 size={18} />
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
  };

  // BOOKS LIST VIEW
  const BooksListView = () => {
    const bookStyles = {
      container: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        minHeight: "calc(100vh - 60px)",
        padding: "2rem",
      },
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "1rem",
      },
      title: {
        color: "white",
        fontSize: "1.8rem",
        fontWeight: 600,
        margin: 0,
        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      },
      subtitle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: "0.95rem",
        margin: "0.25rem 0 0",
      },
      addBtn: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.9rem 1.5rem",
        background: "rgba(255,255,255,0.2)",
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: "12px",
        color: "white",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        transition: "all 0.2s",
      },
      statsRow: {
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem",
      },
      statBadge: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1rem",
        background: "rgba(255,255,255,0.15)",
        borderRadius: "10px",
        color: "white",
        fontSize: "0.9rem",
        backdropFilter: "blur(10px)",
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "1.25rem",
      },
      bookCard: {
        background: "white",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        transition: "all 0.3s",
        cursor: "pointer",
        border: "2px solid transparent",
      },
      cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1rem",
      },
      categoryBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.75rem",
        background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
        color: "#7c3aed",
        padding: "0.35rem 0.75rem",
        borderRadius: "20px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      },
      translationBadge: {
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.8rem",
        color: "#10b981",
        fontWeight: 500,
      },
      bookTitle: {
        margin: "0 0 0.5rem",
        color: "#1f2937",
        fontSize: "1.2rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      bookMeta: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        marginBottom: "1rem",
        fontSize: "0.85rem",
        color: "#6b7280",
      },
      metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
      },
      actions: {
        display: "flex",
        gap: "0.5rem",
        paddingTop: "1rem",
        borderTop: "1px solid #f3f4f6",
      },
      actionBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        padding: "0.7rem",
        border: "none",
        borderRadius: "10px",
        fontSize: "0.85rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
      },
      emptyState: {
        background: "white",
        borderRadius: "24px",
        padding: "4rem 2rem",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    };

    return (
      <>
        <TopBar title="All Books" />
        <div style={bookStyles.container}>
          <div style={bookStyles.header}>
            <div>
              <h1 style={bookStyles.title}><Library size={32} /> Book Library</h1>
              <p style={bookStyles.subtitle}>
                Manage your collection of sacred texts
              </p>
            </div>
            <button
              onClick={startAddBook}
              style={bookStyles.addBtn}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <PlusCircle size={18} /> Add New Book
            </button>
          </div>

          <div style={bookStyles.statsRow}>
            <div style={bookStyles.statBadge}>
              <BookText size={16} /> {books.length}{" "}
              {books.length === 1 ? "Book" : "Books"}
            </div>
            <div style={bookStyles.statBadge}>
              <Globe size={16} />{" "}
              {books.reduce((acc, b) => acc + (b.translations?.length || 0), 0)}{" "}
              Translations
            </div>
          </div>

          {books.length === 0 ? (
            <div style={bookStyles.emptyState}>
              <div style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
                <Library size={64} strokeWidth={1} />
              </div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  color: "#1f2937",
                  fontSize: "1.4rem",
                }}
              >
                No books yet
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "1.5rem",
                  fontSize: "1rem",
                }}
              >
                Start building your sacred text library
              </p>
              <button
                onClick={startAddBook}
                style={{
                  padding: "1rem 2rem",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Plus size={20} /> Add Your First Book
              </button>
            </div>
          ) : (
            <div style={bookStyles.grid}>
              {books.map((book) => (
                <div
                  key={book._id}
                  style={bookStyles.bookCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 50px rgba(0,0,0,0.18)";
                    e.currentTarget.style.borderColor = "#10b981";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 40px rgba(0,0,0,0.12)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div style={bookStyles.cardHeader}>
                    <span style={bookStyles.categoryBadge}>
                      <Tag size={12} /> {book.category || "Uncategorized"}
                    </span>
                    <span style={bookStyles.translationBadge}>
                      <Globe size={14} /> {book.translations?.length || 0}
                    </span>
                  </div>

                  <h3 style={bookStyles.bookTitle}>{book.title}</h3>

                  <div style={bookStyles.bookMeta}>
                    {book.author && (
                      <span style={bookStyles.metaItem}><User size={14} /> {book.author}</span>
                    )}
                    {book.year && (
                      <span style={bookStyles.metaItem}><Calendar size={14} /> {book.year}</span>
                    )}
                    {book.chapters && (
                      <span style={bookStyles.metaItem}>
                        <BookOpen size={14} /> {book.chapters} chapters
                      </span>
                    )}
                    {book.verses && (
                      <span style={bookStyles.metaItem}>
                        <Scroll size={14} /> {book.verses} verses
                      </span>
                    )}
                  </div>

                  {book.description && (
                    <p
                      style={{
                        margin: "0 0 1rem",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                        lineHeight: 1.5,
                      }}
                    >
                      {book.description.length > 100
                        ? book.description.substring(0, 100) + "..."
                        : book.description}
                    </p>
                  )}

                  <div style={bookStyles.actions}>
                    <button
                      onClick={() => manageTranslations(book)}
                      style={{
                        ...bookStyles.actionBtn,
                        background: "#ede9fe",
                        color: "#7c3aed",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#ddd6fe")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#ede9fe")
                      }
                    >
                      <Globe size={16} /> Translations
                    </button>
                    <button
                      onClick={() => startEdit(book)}
                      style={{
                        ...bookStyles.actionBtn,
                        background: "#fef3c7",
                        color: "#92400e",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#fde68a")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#fef3c7")
                      }
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteBook(book._id)}
                      style={{
                        ...bookStyles.actionBtn,
                        background: "#fee2e2",
                        color: "#dc2626",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#fecaca")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#fee2e2")
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // ADD/EDIT BOOK VIEW - rendered inline to prevent re-mount on state change
  const renderBookFormView = () => {
    const formStyles = {
      container: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "calc(100vh - 60px)",
        padding: "2rem",
      },
      header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2rem",
      },
      backBtn: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1rem",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "10px",
        color: "white",
        cursor: "pointer",
        fontSize: "0.9rem",
        backdropFilter: "blur(10px)",
        transition: "all 0.2s",
      },
      title: {
        color: "white",
        fontSize: "1.8rem",
        fontWeight: 600,
        margin: 0,
        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      subtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "0.95rem",
        margin: "0.25rem 0 0",
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "1.5rem",
        alignItems: "start",
      },
      mainCard: {
        background: "white",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      },
      sideCard: {
        background: "white",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      },
      sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        margin: "0 0 1.5rem",
        paddingBottom: "1rem",
        borderBottom: "2px solid #f3f4f6",
      },
      sectionIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
      },
      fieldGroup: {
        marginBottom: "1.25rem",
      },
      label: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.5rem",
        fontSize: "0.9rem",
        color: "#374151",
        fontWeight: 600,
      },
      required: {
        color: "#ef4444",
        fontSize: "0.75rem",
      },
      input: {
        width: "100%",
        padding: "0.9rem 1rem",
        borderRadius: "12px",
        border: "2px solid #e5e7eb",
        fontSize: "0.95rem",
        transition: "all 0.2s",
        outline: "none",
        background: "#fafafa",
      },
      textarea: {
        width: "100%",
        padding: "0.9rem 1rem",
        borderRadius: "12px",
        border: "2px solid #e5e7eb",
        fontSize: "0.95rem",
        resize: "vertical",
        minHeight: "120px",
        outline: "none",
        background: "#fafafa",
        fontFamily: "inherit",
      },
      select: {
        width: "100%",
        padding: "0.9rem 1rem",
        borderRadius: "12px",
        border: "2px solid #e5e7eb",
        fontSize: "0.95rem",
        outline: "none",
        background: "#fafafa",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
        backgroundSize: "1.2rem",
      },
      fieldRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
      },
      submitBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        padding: "1rem 2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "12px",
        color: "white",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
      },
      cancelBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "1rem 2rem",
        background: "#f3f4f6",
        border: "none",
        borderRadius: "12px",
        color: "#6b7280",
        fontSize: "1rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
      },
      toggleCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.9rem 1rem",
        background: "#f9fafb",
        borderRadius: "12px",
        marginBottom: "0.6rem",
        cursor: "pointer",
        transition: "all 0.2s",
        border: "2px solid transparent",
      },
      toggleCardActive: {
        background: "#ede9fe",
        borderColor: "#8b5cf6",
      },
      toggleSwitch: {
        position: "relative",
        width: "44px",
        height: "24px",
        background: "#d1d5db",
        borderRadius: "12px",
        transition: "all 0.2s",
        cursor: "pointer",
      },
      toggleSwitchActive: {
        background: "#8b5cf6",
      },
      toggleKnob: {
        position: "absolute",
        top: "2px",
        left: "2px",
        width: "20px",
        height: "20px",
        background: "white",
        borderRadius: "50%",
        transition: "all 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      toggleKnobActive: {
        left: "22px",
      },
      hint: {
        fontSize: "0.8rem",
        color: "#9ca3af",
        marginTop: "0.4rem",
      },
      progressBar: {
        height: "4px",
        background: "#e5e7eb",
        borderRadius: "2px",
        marginBottom: "1.5rem",
        overflow: "hidden",
      },
      progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #667eea, #764ba2)",
        borderRadius: "2px",
        transition: "width 0.3s ease",
      },
    };

    const getFieldIcon = (key) => {
      const icons = {
        title: <Book size={18} />,
        category: <Tag size={18} />,
        description: <FileText size={18} />,
        originalLanguage: <Globe size={18} />,
        author: <User size={18} />,
        year: <Calendar size={18} />,
        verses: <Scroll size={18} />,
        chapters: <BookOpen size={18} />,
      };
      return icons[key] || <List size={18} />;
    };

    const filledFields = enabledFields.filter(
      (key) => bookForm[key] && String(bookForm[key]).trim()
    );
    const progress =
      enabledFields.length > 0
        ? (filledFields.length / enabledFields.length) * 100
        : 0;

    return (
      <>
        <TopBar title={selectedBook ? "Edit Book" : "Add New Book"} />
        <div style={formStyles.container}>
          <div style={formStyles.header}>
            <button
              onClick={resetForm}
              style={formStyles.backBtn}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
              }
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 style={formStyles.title}>
                {selectedBook ? <><Pencil style={{ display: 'inline' }} size={28} /> Edit Book</> : <><PlusCircle style={{ display: 'inline' }} size={28} /> Add New Book</>}
              </h1>
              <p style={formStyles.subtitle}>
                {selectedBook
                  ? "Update the book details below"
                  : "Fill in the details to add a new sacred text"}
              </p>
            </div>
          </div>

          <div style={formStyles.grid}>
            <div style={formStyles.mainCard}>
              <div style={formStyles.sectionTitle}>
                <div
                  style={{
                    ...formStyles.sectionIcon,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                  }}
                >
                  <BookText size={20} />
                </div>
                <div>
                  <h3
                    style={{ margin: 0, color: "#1f2937", fontSize: "1.1rem" }}
                  >
                    Book Details
                  </h3>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.85rem",
                      color: "#6b7280",
                    }}
                  >
                    {filledFields.length} of {enabledFields.length} fields
                    completed
                  </p>
                </div>
              </div>

              <div style={formStyles.progressBar}>
                <div
                  style={{ ...formStyles.progressFill, width: `${progress}%` }}
                />
              </div>

              <form onSubmit={handleBookSubmit}>
                {DEFAULT_FIELDS.filter((f) =>
                  enabledFields.includes(f.key)
                ).map((field, index) => {
                  const isInRow = [
                    "verses",
                    "chapters",
                    "year",
                    "originalLanguage",
                  ].includes(field.key);
                  const nextField = DEFAULT_FIELDS.filter((f) =>
                    enabledFields.includes(f.key)
                  )[index + 1];
                  const shouldStartRow =
                    (field.key === "verses" &&
                      enabledFields.includes("chapters")) ||
                    (field.key === "year" &&
                      enabledFields.includes("originalLanguage"));
                  const shouldSkip =
                    (field.key === "chapters" &&
                      enabledFields.includes("verses")) ||
                    (field.key === "originalLanguage" &&
                      enabledFields.includes("year"));

                  if (shouldSkip) return null;

                  const renderField = (f) => (
                    <div key={f.key} style={formStyles.fieldGroup}>
                      <label style={formStyles.label}>
                        <span>{getFieldIcon(f.key)}</span>
                        {f.label}
                        {f.required && (
                          <span style={formStyles.required}>Required</span>
                        )}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                          value={bookForm[f.key] || ""}
                          onChange={(e) =>
                            setBookForm((prev) => ({
                              ...prev,
                              [f.key]: e.target.value,
                            }))
                          }
                          style={formStyles.textarea}
                          required={f.required}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#8b5cf6";
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.background = "#fafafa";
                          }}
                        />
                      ) : f.type === "select" ? (
                        <>
                          <select
                            value={bookForm[f.key] || ""}
                            onChange={(e) =>
                              setBookForm((prev) => ({
                                ...prev,
                                [f.key]: e.target.value,
                              }))
                            }
                            style={formStyles.select}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#8b5cf6";
                              e.target.style.background = "white";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#e5e7eb";
                              e.target.style.background = "#fafafa";
                            }}
                          >
                            <option value="">Select {f.label}</option>
                            {getCategoryOptions().map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          {getCategoryOptions().length === 0 && (
                            <p style={formStyles.hint}>
                              <Lightbulb size={12} style={{ display: 'inline', marginRight: '4px' }} /> Create categories first in the Categories
                              section
                            </p>
                          )}
                        </>
                      ) : (
                        <input
                          type={f.type}
                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                          value={bookForm[f.key] || ""}
                          onChange={(e) =>
                            setBookForm((prev) => ({
                              ...prev,
                              [f.key]: e.target.value,
                            }))
                          }
                          style={formStyles.input}
                          required={f.required}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#8b5cf6";
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.background = "#fafafa";
                          }}
                        />
                      )}
                    </div>
                  );

                  if (shouldStartRow) {
                    const pairedKey =
                      field.key === "verses" ? "chapters" : "originalLanguage";
                    const pairedField = DEFAULT_FIELDS.find(
                      (f) => f.key === pairedKey
                    );
                    return (
                      <div key={field.key} style={formStyles.fieldRow}>
                        {renderField(field)}
                        {pairedField &&
                          enabledFields.includes(pairedKey) &&
                          renderField(pairedField)}
                      </div>
                    );
                  }

                  return renderField(field);
                })}

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                >
                  <button
                    type="submit"
                    disabled={!selectedBook && !bookForm.category}
                    style={{
                      ...formStyles.submitBtn,
                      opacity: !selectedBook && !bookForm.category ? 0.5 : 1,
                      cursor:
                        !selectedBook && !bookForm.category
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (!(!selectedBook && !bookForm.category)) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(102, 126, 234, 0.5)";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(102, 126, 234, 0.4)";
                    }}
                  >
                    {selectedBook ? <><Save size={18} /> Update Book</> : <><Plus size={18} /> Create Book</>}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={formStyles.cancelBtn}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#e5e7eb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#f3f4f6")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div style={formStyles.sideCard}>
              <div style={formStyles.sectionTitle}>
                <div
                  style={{
                    ...formStyles.sectionIcon,
                    background: "#fef3c7",
                    color: "#f59e0b",
                  }}
                >
                  <Settings size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#1f2937", fontSize: "1rem" }}>
                    Field Options
                  </h3>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Customize visible fields
                  </p>
                </div>
              </div>

              {DEFAULT_FIELDS.map((field) => {
                const isActive = enabledFields.includes(field.key);
                const isRequired = field.required;
                return (
                  <div
                    key={field.key}
                    onClick={() => !isRequired && toggleField(field.key)}
                    style={{
                      ...formStyles.toggleCard,
                      ...(isActive ? formStyles.toggleCardActive : {}),
                      opacity: isRequired ? 0.6 : 1,
                      cursor: isRequired ? "not-allowed" : "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>
                        {getFieldIcon(field.key)}
                      </span>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          {field.label}
                        </p>
                        {isRequired && (
                          <p
                            style={{
                              margin: "0.1rem 0 0",
                              fontSize: "0.7rem",
                              color: "#9ca3af",
                            }}
                          >
                            Always required
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        ...formStyles.toggleSwitch,
                        ...(isActive ? formStyles.toggleSwitchActive : {}),
                      }}
                    >
                      <div
                        style={{
                          ...formStyles.toggleKnob,
                          ...(isActive ? formStyles.toggleKnobActive : {}),
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  color: "#92400e",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}><Lightbulb size={16} /> Pro Tip</p>
                <p style={{ margin: "0.5rem 0 0" }}>
                  Enable only the fields you need. You can always add more later
                  when editing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // TRANSLATIONS VIEW - rendered inline to prevent re-mount on state change
  const renderTranslationsView = () => (
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
                type="text"
                placeholder="e.g., Swami Vivekananda"
                value={translationForm.translatorName}
                onChange={(e) =>
                  setTranslationForm({
                    ...translationForm,
                    translatorName: e.target.value,
                  })
                }
                required
                style={{ ...styles.input, boxSizing: "border-box" }}
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
                type="text"
                placeholder="e.g., English, Hindi"
                value={translationForm.language}
                onChange={(e) =>
                  setTranslationForm({
                    ...translationForm,
                    language: e.target.value,
                  })
                }
                required
                style={{ ...styles.input, boxSizing: "border-box" }}
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
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        {activeTab === "dashboard" && view === "list" && <DashboardView />}
        {activeTab === "books" && view === "list" && <BooksListView />}
        {activeTab === "categories" &&
          view === "list" &&
          renderCategoriesView()}
        {(activeTab === "add" || view === "addBook" || view === "editBook") &&
          renderBookFormView()}
        {view === "manageTranslations" && renderTranslationsView()}
      </main>
    </div>
  );
}
