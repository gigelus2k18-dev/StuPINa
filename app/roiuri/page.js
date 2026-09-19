"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function RoiuriPage() {
  const [roiuri, setRoiuri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    numar: "",
    tip: "Roi",
    data_formare: new Date().toISOString().split("T")[0],
    matca: "",
    an_matca: "",
    rame: "",
    rame_puiet: "",
    rame_miere: "",
    rame_polen: "",
    origine: "",
    status: "Activ",
    observatii: "",
  });

  useEffect(() => {
    loadRoiuri();
  }, []);

  async function loadRoiuri() {
    setLoading(true);

    const { data, error } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar", { ascending: true });

    if (error) {
      console.error(error);
      alert("Eroare la încărcarea roiurilor: " + error.message);
    } else {
      setRoiuri(data || []);
    }

    setLoading(false);
  }

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function addRoi() {
    if (!form.numar.trim()) {
      alert("Completează numărul roiului/nucleului.");
      return;
    }

    setSaving(true);

    const record = {
      numar: form.numar.trim(),
      tip: form.tip,
      data_formare: form.data_formare || null,
      matca: form.matca || null,
      an_matca: form.an_matca ? Number(form.an_matca) : null,
      rame: form.rame ? Number(form.rame) : null,
      rame_puiet: form.rame_puiet ? Number(form.rame_puiet) : null,
      rame_miere: form.rame_miere ? Number(form.rame_miere) : null,
      rame_polen: form.rame_polen ? Number(form.rame_polen) : null,
      origine: form.origine || null,
      status: form.status,
      observatii: form.observatii || null,
    };

    const { data, error } = await supabase
      .from("roiuri")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Eroare la adăugare: " + error.message);
    } else {
      setRoiuri((prev) =>
        [...prev, data].sort((a, b) =>
          String(a.numar).localeCompare(String(b.numar), undefined, {
            numeric: true,
          })
        )
      );

      setForm({
        numar: "",
        tip: "Roi",
        data_formare: new Date().toISOString().split("T")[0],
        matca: "",
        an_matca: "",
        rame: "",
        rame_puiet: "",
        rame_miere: "",
        rame_polen: "",
        origine: "",
        status: "Activ",
        observatii: "",
      });

      setShowForm(false);
      alert("Roiul/nucleul a fost adăugat!");
    }

    setSaving(false);
  }

  async function deleteRoi(id) {
    const roi = roiuri.find((item) => item.id === id);

    const confirmare = window.confirm(
      "Sigur vrei să ștergi " +
        (roi?.tip || "acest element") +
        " " +
        (roi?.numar || "") +
        "?"
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("roiuri")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Eroare la ștergere: " + error.message);
    } else {
      setRoiuri((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const activeCount = roiuri.filter(
    (item) => item.status === "Activ"
  ).length;

  const roiCount = roiuri.filter(
    (item) => item.tip === "Roi"
  ).length;

  const nucleuCount = roiuri.filter(
    (item) => item.tip === "Nucleu"
  ).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>🐝 Roiuri / Nuclee</h1>
            <p style={styles.subtitle}>
              Gestionarea roiurilor și nucleelor din StuPINa
            </p>
          </div>

          <Link href="/" style={styles.backButton}>
            ← Înapoi
          </Link>
        </div>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{roiuri.length}</div>
            <div style={styles.statLabel}>Total</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{activeCount}</div>
            <div style={styles.statLabel}>Active</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{roiCount}</div>
            <div style={styles.statLabel}>Roiuri</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>{nucleuCount}</div>
            <div style={styles.statLabel}>Nuclee</div>
          </div>
        </section>

        <div style={styles.actionBar}>
          <button
            style={styles.addButton}
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Adaugă roi / nucleu
          </button>
        </div>

        {showForm && (
          <section style={styles.formCard}>
            <h2 style={styles.formTitle}>
              ➕ Adaugă roi / nucleu
            </h2>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label>Număr / ID *</label>
                <input
                  value={form.numar}
                  onChange={(e) =>
                    updateForm("numar", e.target.value)
                  }
                  placeholder="Ex: R001"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Tip</label>
                <select
                  value={form.tip}
                  onChange={(e) =>
                    updateForm("tip", e.target.value)
                  }
                  style={styles.input}
                >
                  <option>Roi</option>
                  <option>Nucleu</option>
                </select>
              </div>

              <div style={styles.field}>
                <label>Data formării</label>
                <input
                  type="date"
                  value={form.data_formare}
                  onChange={(e) =>
                    updateForm("data_formare", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Matcă</label>
                <input
                  value={form.matca}
                  onChange={(e) =>
                    updateForm("matca", e.target.value)
                  }
                  placeholder="Ex: Împerecheată"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>An matcă</label>
                <input
                  type="number"
                  value={form.an_matca}
                  onChange={(e) =>
                    updateForm("an_matca", e.target.value)
                  }
                  placeholder="2026"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Rame</label>
                <input
                  type="number"
                  value={form.rame}
                  onChange={(e) =>
                    updateForm("rame", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Rame cu puiet</label>
                <input
                  type="number"
                  value={form.rame_puiet}
                  onChange={(e) =>
                    updateForm("rame_puiet", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Rame cu miere</label>
                <input
                  type="number"
                  value={form.rame_miere}
                  onChange={(e) =>
                    updateForm("rame_miere", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Rame cu polen</label>
                <input
                  type="number"
                  value={form.rame_polen}
                  onChange={(e) =>
                    updateForm("rame_polen", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Origine</label>
                <input
                  value={form.origine}
                  onChange={(e) =>
                    updateForm("origine", e.target.value)
                  }
                  placeholder="Ex: Stup 45"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm("status", e.target.value)
                  }
                  style={styles.input}
                >
                  <option>Activ</option>
                  <option>Vândut</option>
                  <option>Unit</option>
                  <option>Pierdut</option>
                </select>
              </div>

              <div style={styles.fieldFull}>
                <label>Observații</label>
                <textarea
                  value={form.observatii}
                  onChange={(e) =>
                    updateForm("observatii", e.target.value)
                  }
                  placeholder="Observații despre roi/nucleu..."
                  style={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowForm(false)}
              >
                Anulează
              </button>

              <button
                style={styles.saveButton}
                onClick={addRoi}
                disabled={saving}
              >
                {saving ? "Se salvează..." : "💾 Salvează"}
              </button>
            </div>
          </section>
        )}

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>
              Roiurile și nucleele mele
            </h2>
          </div>

          {loading ? (
            <p style={styles.message}>Se încarcă...</p>
          ) : roiuri.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🐝</div>
              <h3>Nu ai încă roiuri sau nuclee</h3>
              <p>
                Apasă „Adaugă roi / nucleu” pentru a începe.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nr.</th>
                    <th style={styles.th}>Tip</th>
                    <th style={styles.th}>Formare</th>
                    <th style={styles.th}>Matcă</th>
                    <th style={styles.th}>Rame</th>
                    <th style={styles.th}>Puiet</th>
                    <th style={styles.th}>Miere</th>
                    <th style={styles.th}>Polen</th>
                    <th style={styles.th}>Origine</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Acțiuni</th>
                  </tr>
                </thead>

                <tbody>
                  {roiuri.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <strong>{item.numar}</strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            item.tip === "Roi"
                              ? styles.roiBadge
                              : styles.nucleuBadge
                          }
                        >
                          {item.tip}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {item.data_formare
                          ? new Date(
                              item.data_formare
                            ).toLocaleDateString("ro-RO")
                          : "-"}
                      </td>

                      <td style={styles.td}>
                        {item.matca || "-"}
                        {item.an_matca
                          ? ` (${item.an_matca})`
                          : ""}
                      </td>

                      <td style={styles.td}>
                        {item.rame ?? "-"}
                      </td>

                      <td style={styles.td}>
                        {item.rame_puiet ?? "-"}
                      </td>

                      <td style={styles.td}>
                        {item.rame_miere ?? "-"}
                      </td>

                      <td style={styles.td}>
                        {item.rame_polen ?? "-"}
                      </td>

                      <td style={styles.td}>
                        {item.origine || "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            item.status === "Activ"
                              ? styles.activeBadge
                              : styles.otherBadge
                          }
                        >
                          {item.status}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.deleteButton}
                          onClick={() => deleteRoi(item.id)}
                        >
                          🗑️ Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1500px",
    margin: "0 auto",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#222",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#666",
  },

  backButton: {
    padding: "11px 17px",
    background: "#fff",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  statNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#222",
  },

  statLabel: {
    marginTop: "6px",
    color: "#777",
  },

  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },

  addButton: {
    border: "none",
    borderRadius: "9px",
    padding: "13px 20px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },

  formCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "22px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  formTitle: {
    marginTop: 0,
    marginBottom: "22px",
    color: "#222",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "17px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fieldFull: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    gridColumn: "1 / -1",
  },

  input: {
    padding: "11px 12px",
    border: "1px solid #d6d6d6",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fff",
  },

  textarea: {
    padding: "11px 12px",
    border: "1px solid #d6d6d6",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },

  saveButton: {
    padding: "11px 20px",
    border: "none",
    background: "#2e7d32",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  tableCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  tableHeader: {
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    color: "#222",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    fontSize: "13px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  roiBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#fff3cd",
    color: "#856404",
    fontWeight: "bold",
  },

  nucleuBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#d1ecf1",
    color: "#0c5460",
    fontWeight: "bold",
  },

  activeBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#d4edda",
    color: "#155724",
    fontWeight: "bold",
  },

  otherBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#eee",
    color: "#555",
    fontWeight: "bold",
  },

  deleteButton: {
    border: "none",
    background: "#ffebee",
    color: "#c62828",
    padding: "7px 10px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  message: {
    textAlign: "center",
    padding: "30px",
    color: "#777",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#777",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
};
