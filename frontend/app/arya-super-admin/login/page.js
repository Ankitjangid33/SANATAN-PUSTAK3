"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSetup, setIsSetup] = useState(false);
  const [adminExists, setAdminExists] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/arya-super-admin");
      return;
    }
    checkAdminExists();
  }, [router]);

  const checkAdminExists = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setAdminExists(data.adminExists);
      setIsSetup(!data.adminExists);
    } catch {
      setError("Failed to connect to server");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSetup && form.password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (isSetup) {
        setIsSetup(false);
        setAdminExists(true);
        setForm({ username: "", password: "" });
        setConfirmPassword("");
        alert("Admin account created! Please login.");
      } else {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUsername", data.username);
        router.push("/arya-super-admin");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
      padding: "1rem",
    },
    card: {
      background: "white",
      borderRadius: "24px",
      padding: "2.5rem",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    icon: {
      fontSize: "3rem",
      marginBottom: "1rem",
    },
    title: {
      margin: 0,
      fontSize: "1.75rem",
      fontWeight: 700,
      color: "#1f2937",
    },
    subtitle: {
      margin: "0.5rem 0 0",
      color: "#6b7280",
      fontSize: "0.95rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#374151",
    },
    input: {
      padding: "0.875rem 1rem",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      fontSize: "1rem",
      outline: "none",
      transition: "all 0.2s",
    },
    button: {
      padding: "1rem",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      border: "none",
      borderRadius: "12px",
      color: "white",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s",
      marginTop: "0.5rem",
    },
    error: {
      background: "#fef2f2",
      color: "#dc2626",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      fontSize: "0.9rem",
      textAlign: "center",
    },
  };

  if (adminExists === null) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ color: "#6b7280" }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>{isSetup ? "🔐" : "📚"}</div>
          <h1 style={styles.title}>
            {isSetup ? "Create Admin Account" : "Super Admin Login"}
          </h1>
          <p style={styles.subtitle}>
            {isSetup
              ? "Set up your admin credentials"
              : "Sacred Texts Management System"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {isSetup && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : isSetup ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
