"use client";

import { useState } from "react";

interface StudentRow {
  full_name: string;
  email: string;
  country?: string;
}

interface ResultRow {
  email: string;
  status: "created" | "skipped" | "error";
  reason?: string;
}

function parseCsv(text: string): StudentRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // Detect and skip a header row like "Full Name,Email,Country"
  const first = lines[0].toLowerCase();
  const startIdx = first.includes("email") ? 1 : 0;

  const rows: StudentRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",").map((p) => p.trim());
    const [full_name, email, country] = parts;
    if (full_name && email) {
      rows.push({ full_name, email, country: country || undefined });
    }
  }
  return rows;
}

export default function EnrollStudentsPage() {
  const [csvText, setCsvText] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setCsvText(text);
      setStudents(parseCsv(text));
    };
    reader.readAsText(file);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setCsvText(text);
    setStudents(parseCsv(text));
  }

  async function handleSubmit() {
    setError(null);
    setResults(null);
    setSummary(null);

    if (students.length === 0) {
      setError("No valid student rows found. Expect: Full Name, Email, Country (optional)");
      return;
    }
    if (!demoBalance || demoBalance <= 0) {
      setError("Enter a positive demo balance to grant this batch.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: replace with your actual logged-in admin user id (from your auth session)
      const adminId = "REPLACE_WITH_ADMIN_USER_ID";

      const res = await fetch("/api/admin/enroll-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students, demo_balance: demoBalance, admin_id: adminId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Enrollment failed");
      } else {
        setSummary(data.summary);
        setResults(data.results);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Enroll Academy Students
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Paste or upload real student names/emails collected from online or offline academy
        sessions. Each student gets a real account plus a demo trading balance you set below.
      </p>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        Upload CSV (Full Name, Email, Country)
      </label>
      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ marginBottom: 16 }} />

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        ...or paste rows directly
      </label>
      <textarea
        value={csvText}
        onChange={handleTextChange}
        rows={8}
        placeholder={"Full Name,Email,Country\nJane Doe,jane@example.com,Nigeria"}
        style={{ width: "100%", fontFamily: "monospace", padding: 8, marginBottom: 16 }}
      />

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        Demo balance to grant this batch (USD)
      </label>
      <input
        type="number"
        value={demoBalance}
        onChange={(e) => setDemoBalance(Number(e.target.value))}
        style={{ padding: 8, marginBottom: 16, width: 200 }}
      />

      <div style={{ marginBottom: 16, color: "#333" }}>
        <strong>{students.length}</strong> valid student row(s) detected.
      </div>

      {students.length > 0 && (
        <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", marginBottom: 16, fontSize: 13 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 4 }}>Name</th>
                <th style={{ textAlign: "left", padding: 4 }}>Email</th>
                <th style={{ textAlign: "left", padding: 4 }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 50).map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: 4 }}>{s.full_name}</td>
                  <td style={{ padding: 4 }}>{s.email}</td>
                  <td style={{ padding: 4 }}>{s.country || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > 50 && <div style={{ padding: 4, color: "#888" }}>...and {students.length - 50} more</div>}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || students.length === 0}
        style={{
          background: "#111",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? "Enrolling..." : `Enroll ${students.length} student(s)`}
      </button>

      {error && <div style={{ color: "#b00020", marginTop: 16 }}>{error}</div>}

      {summary && (
        <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
          <div>Total: {summary.total}</div>
          <div>Created: {summary.created}</div>
          <div>Skipped (already registered): {summary.skipped}</div>
          <div>Errors: {summary.errors}</div>
        </div>
      )}

      {results && (
        <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 16, fontSize: 13 }}>
          {results
            .filter((r) => r.status !== "created")
            .map((r, i) => (
              <div key={i} style={{ padding: 4, color: r.status === "error" ? "#b00020" : "#888" }}>
                {r.email} — {r.status}
                {r.reason ? `: ${r.reason}` : ""}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
