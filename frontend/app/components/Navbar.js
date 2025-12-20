"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLang, setSearchLang] = useState("all"); // all, hindi, english
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/?search=${encodeURIComponent(searchQuery)}&lang=${searchLang}`
      );
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          <span className="brand-icon">🕉️</span>
          <span className="brand-text">Sacred Texts</span>
        </Link>

        <form className="search-box" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search in Hindi or English... / हिंदी या अंग्रेजी में खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={searchLang}
              onChange={(e) => setSearchLang(e.target.value)}
              className="search-lang-select"
            >
              <option value="all">All / सभी</option>
              <option value="hindi">हिंदी</option>
              <option value="english">English</option>
            </select>
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>

        <div className="navbar-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/#categories" className="nav-link">
            Categories
          </Link>
          <Link href="/#about" className="nav-link">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
