"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [category]);

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
      const url = category ? `/api/books?category=${category}` : "/api/books";
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
      </header>

      <div className="container">
        <div className="filter-bar">
          <button
            className={`filter-btn ${category === "" ? "active" : ""}`}
            onClick={() => setCategory("")}
          >
            All
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
            Loading sacred texts...
          </p>
        ) : books.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            No texts found in this category.
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
                    📜 {book.translations?.length || 0} translation
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
