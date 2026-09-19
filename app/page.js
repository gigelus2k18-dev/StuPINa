"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

  function startEdit(stup) {
    setEditingId(stup.id);
    setEditData({
      matca: stup.matca || "",
      an_matca: stup.an_matca || "",
      rame: stup.rame || "",
      rame_puiet: stup.rame_puiet || "",
      rame_miere: stup.rame_miere || "",
      rame_polen: stup.rame_polen || "",
      miere_kg: stup.miere_kg || "",
      status: stup.status || "",
      observatii: stup.observatii || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  function handleChange(field, value) {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveEdit(id) {
    const { data, error } = await supabase
      .from("stupi")
      .update({
        matca: editData.matca || null,
        an_matca: editData.an_matca ? Number(editData.an_matca) : null,
        rame: editData.rame ? Number(editData.rame) : null,
        rame_puiet: editData.rame_puiet
          ? Number(editData.rame_puiet)
          : null,
        rame_miere: editData.rame_miere
          ? Number(editData.rame_miere)
          : null,
        rame_polen: editData.rame_polen
          ? Number(editData.rame_polen)
          : null,
        miere_kg: editData.miere_kg
          ? Number(editData.miere_kg)
          : null,
        status: editData.status || null,
        observatii: editData.observatii || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Eroare la salvare: " + error.message);
      return;
    }

    setStupi((prev) =>
      prev.map((stup) => (stup.id === id ? data : stup))
    );

    setEditingId(null);
    setEditData({});
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

        <div style={styles.count}>{stupi.length} stupi</div>
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
              <th style={styles.th}>Acțiuni</th>
            </tr>
          </thead>

          <tbody>
            {stupi.map((stup) => {
              const isEditing = editingId === stup.id;

              return (
                <tr key={stup.id}>
                  <td style={styles.tdNumber}>{stup.numar_stup}</td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.input}
                        value={editData.matca}
                        onChange={(e) =>
                          handleChange("matca", e.target.value)
                        }
                      />
                    ) : (
                      stup.matca || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.inputSmall}
                        type="number"
                        value={editData.an_matca}
                        onChange={(e) =>
                          handleChange("an_matca", e.target.value)
                        }
                      />
                    ) : (
                      stup.an_matca || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.inputSmall}
                        type="number"
                        value={editData.rame}
                        onChange={(e) =>
                          handleChange("rame", e.target.value)
                        }
                      />
                    ) : (
                      stup.rame || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.inputSmall}
                        type="number"
                        value={editData.rame_puiet}
                        onChange={(e) =>
                          handleChange("rame_puiet", e.target.value)
                        }
                      />
                    ) : (
                      stup.rame_puiet || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.inputSmall}
                        type="number"
                        step="0.1"
                        value={editData.miere_kg}
                        onChange={(e) =>
                          handleChange("miere_kg", e.target.value)
                        }
                      />
                    ) : (
                      stup.miere_kg || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.inputSmall}
                        type="number"
                        value={editData.rame_polen}
                        onChange={(e) =>
                          handleChange("rame_polen", e.target.value)
                        }
                      />
                    ) : (
                      stup.rame_polen || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.input}
                        value={editData.status}
                        onChange={(e) =>
                          handleChange("status", e.target.value)
                        }
                      />
                    ) : (
                      stup.status || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        style={styles.input}
                        value={editData.observatii}
                        onChange={(e) =>
                          handleChange("observatii", e.target.value)
                        }
                      />
                    ) : (
                      stup.observatii || "—"
                    )}
                  </td>

                  <td style={styles.td}>
                    {isEditing ? (
                      <div style={styles.actions}>
                        <button
                          style={styles.saveButton}
                          onClick={() => saveEdit(stup.id)}
                        >
                          Salvează
                        </button>

                        <button
                          style={styles.cancelButton}
                          onClick={cancelEdit}
                        >
                          Anulează
                        </button>
                      </div>
                    ) : (
                      <button
                        style={styles.editButton}
                        onClick={() => startEdit(stup)}
                      >
                        Editează
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
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
    minWidth: "1200px",
  },

  th: {
    padding: "14px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    background: "#fafafa",
  },

  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #eee",
  },

  tdNumber: {
    padding: "10px 14px",
    borderBottom: "1px solid #eee",
    fontWeight: "bold",
  },

  input: {
    width: "120px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },

  inputSmall: {
    width: "65px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    gap: "6px",
  },

  editButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#222",
    color: "#fff",
  },

  saveButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#2e7d32",
    color: "#fff",
  },

  cancelButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#777",
    color: "#fff",
  },
};
