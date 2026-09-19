"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStupi();
  }, []);

  async function getStupi() {
    const { data, error } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup", { ascending: true });

    if (error) {
      console.error(error);
      alert("Nu s-au putut încărca stupii.");
    } else {
      setStupi(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <h1>🐝 StuPINa</h1>
        <p>Se încarcă stupii...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🐝 StuPINa</h1>
          <p style={styles.subtitle}>Gestiunea stupinei</p>
        </div>

        <div style={styles.count}>
          {stupi.length} stupi
        </div>
      </header>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nr. stup</th>
              <th style={styles.th}>Matcă</th>
              <th style={styles.th}>An matcă</th>
              <th style={styles.th}>Rame</th>
              <th style={styles.th}>Puiet</th>
              <th style={styles.th}>Miere kg</th>
              <th style={styles.th}>Polen</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Observații</th>
            </tr>
          </thead>

          <tbody>
            {stupi.map((stup) => (
              <tr key={stup.id}>
                <td style={styles.tdNumber}>{stup.numar_stup}</td>
                <td style={styles.td}>{stup.matca || "—"}</td>
                <td style={styles.td}>{stup.an_matca || "—"}</td>
                <td style={styles.td}>{stup.rame || "—"}</td>
                <td style={styles.td}>{stup.rame_puiet || "—"}</td>
                <td style={styles.td}>{stup.miere_kg || "—"}</td>
                <td style={styles.td}>{stup.rame_polen || "—"}</td>
                <td style={styles.td}>{stup.status || "—"}</td>
                <td style={styles.td}>{stup.observatii || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#666",
  },

  count: {
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    padding: "14px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    background: "#fafafa",
  },

  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
  },

  tdNumber: {
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
    fontWeight: "bold",
  },
};
