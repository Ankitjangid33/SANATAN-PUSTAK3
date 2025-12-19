"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState(null);

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        if (data.translations?.length > 0) {
          setSelectedTranslation(data.translations[0]);
        }
      });
  }, [id]);

  if (!book) {
    return (
      <div
        className="container"
        style={{ paddingTop: "4rem", textAlign: "center" }}
      >
        <p style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <header className="header" style={{ padding: "2rem 1rem" }}>
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.9rem",
            display: "inline-block",
            marginBottom: "1rem",
          }}
        >
          ← Back to Library
        </Link>
        <span
          className="book-category"
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "white",
            display: "inline-block",
            marginBottom: "0.5rem",
          }}
        >
          {book.category}
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {book.title}
        </h1>
        <p style={{ opacity: 0.85, maxWidth: "600px", margin: "0 auto" }}>
          {book.description}
        </p>
      </header>

      <div className="container">
        {book.translations?.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#666", fontWeight: 500 }}>
                Choose Translation:
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {book.translations.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTranslation(t)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      background:
                        selectedTranslation?._id === t._id
                          ? "#c2410c"
                          : "white",
                      color:
                        selectedTranslation?._id === t._id ? "white" : "#666",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "all 0.2s",
                    }}
                  >
                    {t.translatorName}
                  </button>
                ))}
              </div>
            </div>

            {selectedTranslation && (
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "2rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        color: "#1f1f1f",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {selectedTranslation.translatorName}
                    </h3>
                    <span style={{ fontSize: "0.85rem", color: "#888" }}>
                      {selectedTranslation.language}
                    </span>
                  </div>
                  {selectedTranslation.fileUrl && (
                    <a
                      href={selectedTranslation.fileUrl}
                      target="_blank"
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#fff7ed",
                        color: "#c2410c",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    >
                      📄 Download
                    </a>
                  )}
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.9",
                    fontSize: "1.05rem",
                    color: "#444",
                  }}
                >
                  {selectedTranslation.content}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "white",
              borderRadius: "16px",
            }}
          >
            <p style={{ color: "#888" }}>
              No translations available yet for this text.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
