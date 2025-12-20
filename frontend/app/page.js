"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ScrollText } from "lucide-react";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const searchLang = searchParams.get("lang") || "all";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [category, searchQuery, searchLang]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = "/api/books?";
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (searchQuery) params.append("search", searchQuery);
      if (searchLang && searchLang !== "all") params.append("lang", searchLang);

      url += params.toString();
      const res = await fetch(url);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    }
    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <h1>॥ Sacred Texts ॥</h1>
        <p>Explore the timeless wisdom of ancient scriptures</p>
        <p className="header-hindi">
          प्राचीन शास्त्रों की शाश्वत ज्ञान का अन्वेषण करें
        </p>
      </header>

      <div className="container">
        {searchQuery && (
          <div className="search-results-info">
            <p>
              Search results for: <strong>"{searchQuery}"</strong>
              {searchLang !== "all" && (
                <span> in {searchLang === "hindi" ? "हिंदी" : "English"}</span>
              )}
            </p>
            <Link href="/" className="clear-search">
              Clear Search
            </Link>
          </div>
        )}

        <div className="filter-bar" id="categories">
          <button
            className={`filter-btn ${category === "" ? "active" : ""}`}
            onClick={() => setCategory("")}
          >
            All / सभी
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`filter-btn ${category === cat.name ? "active" : ""}`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Loading sacred texts... / पवित्र ग्रंथ लोड हो रहे हैं...
          </p>
        ) : books.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            No texts found. / कोई ग्रंथ नहीं मिला।
          </p>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <Link href={`/book/${book._id}`} key={book._id}>
                <div className="book-card">
                  <span className="book-category">{book.category}</span>
                  <h3>{book.title}</h3>
                  <p>
                    {book.description?.slice(0, 100)}
                    {book.description?.length > 100 ? "..." : ""}
                  </p>
                  <div className="book-meta">
                    <ScrollText
                      size={16}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: "4px",
                      }}
                    />{" "}
                    {book.translations?.length || 0} translation
                    {book.translations?.length !== 1 ? "s" : ""} available
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
